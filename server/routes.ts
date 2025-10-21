import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./supabase-storage";
import { insertSystemSchema, type System } from "@shared/schema";
import { z } from "zod";
import { supabase, uploadQRCode, deleteQRCode, getQRCodeBuffer } from "./supabase";
import { generateQRCode, createQRPayload, getQRFileName } from "./qr-generator";
import JSZip from "jszip";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // GET all systems
  app.get("/api/systems", async (req, res) => {
    try {
      const systems = await storage.getAllSystems();
      res.json(systems);
    } catch (error) {
      console.error("Error fetching systems:", error);
      res.status(500).json({ error: "Failed to fetch systems" });
    }
  });

  // GET system by ID
  app.get("/api/systems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const system = await storage.getSystemById(id);
      
      if (!system) {
        return res.status(404).json({ error: "System not found" });
      }
      
      res.json(system);
    } catch (error) {
      console.error("Error fetching system:", error);
      res.status(500).json({ error: "Failed to fetch system" });
    }
  });

  // POST create system(s)
  app.post("/api/systems", async (req, res) => {
    try {
      const { labName, numberOfSystems = 1, description } = req.body;
      
      const validation = insertSystemSchema
        .omit({ idCode: true, qrImageUrl: true, qrPayload: true, systemUrl: true })
        .extend({
          numberOfSystems: z.number().min(1).max(100).optional(),
        })
        .safeParse({ labName, description, numberOfSystems });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const systemsToCreate = [];
      let nextIdCode = await storage.getNextIdForLab(labName);

      for (let i = 0; i < numberOfSystems; i++) {
        systemsToCreate.push({
          labName,
          description,
          idCode: nextIdCode,
          qrImageUrl: null,
          qrPayload: null,
          systemUrl: null,
        });

        const parts = nextIdCode.split('-');
        const num = parseInt(parts[1]) + 1;
        nextIdCode = `${labName}-${String(num).padStart(3, '0')}`;
      }

      const createdSystems = await storage.createMultipleSystems(systemsToCreate);

      for (const system of createdSystems) {
        try {
          const payload = createQRPayload(system);
          const qrBuffer = await generateQRCode(payload);
          const fileName = getQRFileName(system.idCode);
          const qrImageUrl = await uploadQRCode(fileName, qrBuffer);

          await storage.updateSystem(system.id, {
            qrImageUrl,
            qrPayload: JSON.stringify(payload),
            systemUrl: payload.systemUrl,
          });
        } catch (qrError) {
          console.error(`Failed to generate QR for ${system.idCode}:`, qrError);
        }
      }

      const updatedSystems = await Promise.all(
        createdSystems.map(s => storage.getSystemById(s.id))
      );

      res.status(201).json(updatedSystems.filter(Boolean));
    } catch (error) {
      console.error("Error creating systems:", error);
      res.status(500).json({ error: "Failed to create systems" });
    }
  });

  // PUT update system
  app.put("/api/systems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { labName, description } = req.body;

      const validation = insertSystemSchema
        .omit({ idCode: true, qrImageUrl: true, qrPayload: true, systemUrl: true })
        .partial()
        .safeParse({ labName, description });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors });
      }

      const existing = await storage.getSystemById(id);
      if (!existing) {
        return res.status(404).json({ error: "System not found" });
      }

      const updated = await storage.updateSystem(id, { labName, description });

      if (updated) {
        try {
          const payload = createQRPayload(updated);
          const qrBuffer = await generateQRCode(payload);
          const fileName = getQRFileName(updated.idCode);
          const qrImageUrl = await uploadQRCode(fileName, qrBuffer);

          await storage.updateSystem(id, {
            qrImageUrl,
            qrPayload: JSON.stringify(payload),
            systemUrl: payload.systemUrl,
          });

          const final = await storage.getSystemById(id);
          res.json(final);
        } catch (qrError) {
          console.error("Failed to regenerate QR:", qrError);
          res.json(updated);
        }
      } else {
        res.status(404).json({ error: "System not found" });
      }
    } catch (error) {
      console.error("Error updating system:", error);
      res.status(500).json({ error: "Failed to update system" });
    }
  });

  // DELETE single system
  app.delete("/api/systems/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const system = await storage.getSystemById(id);
      
      if (!system) {
        return res.status(404).json({ error: "System not found" });
      }

      if (system.idCode) {
        try {
          await deleteQRCode(getQRFileName(system.idCode));
        } catch (error) {
          console.error("Failed to delete QR code from storage:", error);
        }
      }

      const deleted = await storage.deleteSystem(id);
      
      if (deleted) {
        res.json({ success: true, message: "System deleted successfully" });
      } else {
        res.status(404).json({ error: "System not found" });
      }
    } catch (error) {
      console.error("Error deleting system:", error);
      res.status(500).json({ error: "Failed to delete system" });
    }
  });

  // POST bulk delete systems
  app.post("/api/systems/bulk-delete", async (req, res) => {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: "Invalid or empty IDs array" });
      }

      const systems = await Promise.all(ids.map(id => storage.getSystemById(id)));
      const validSystems = systems.filter(Boolean) as System[];

      for (const system of validSystems) {
        if (system.idCode) {
          try {
            await deleteQRCode(getQRFileName(system.idCode));
          } catch (error) {
            console.error(`Failed to delete QR for ${system.idCode}:`, error);
          }
        }
      }

      const deletedCount = await storage.deleteSystems(ids);

      res.json({ 
        success: true, 
        deletedCount,
        message: `${deletedCount} system(s) deleted successfully` 
      });
    } catch (error) {
      console.error("Error bulk deleting systems:", error);
      res.status(500).json({ error: "Failed to delete systems" });
    }
  });

  // GET export systems to CSV
  app.get("/api/systems/export/csv", async (req, res) => {
    try {
      const systems = await storage.getAllSystems();
      
      const csvHeader = "System ID,Lab Name,Configuration,QR Image URL,System URL,Created At\n";
      const csvRows = systems.map(system => {
        const row = [
          system.idCode,
          system.labName,
          `"${system.description.replace(/"/g, '""')}"`,
          system.qrImageUrl || "",
          system.systemUrl || "",
          system.createdAt ? new Date(system.createdAt).toISOString() : "",
        ];
        return row.join(",");
      }).join("\n");

      const csv = csvHeader + csvRows;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="systems-export-${Date.now()}.csv"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      res.status(500).json({ error: "Failed to export CSV" });
    }
  });

  // GET bulk download QR codes by lab
  app.get("/api/systems/export/qr/:labName", async (req, res) => {
    try {
      const { labName } = req.params;
      const systems = await storage.getSystemsByLab(labName);

      if (systems.length === 0) {
        return res.status(404).json({ error: "No systems found for this lab" });
      }

      const zip = new JSZip();
      const folder = zip.folder(labName);

      if (!folder) {
        return res.status(500).json({ error: "Failed to create ZIP folder" });
      }

      for (const system of systems) {
        if (system.qrImageUrl) {
          try {
            const buffer = await getQRCodeBuffer(system.qrImageUrl);
            if (buffer) {
              folder.file(`${system.idCode}.png`, buffer);
            }
          } catch (error) {
            console.error(`Failed to fetch QR for ${system.idCode}:`, error);
          }
        }
      }

      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${labName}-qr-codes.zip"`);
      res.send(zipBuffer);
    } catch (error) {
      console.error("Error generating ZIP:", error);
      res.status(500).json({ error: "Failed to generate QR codes ZIP" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
