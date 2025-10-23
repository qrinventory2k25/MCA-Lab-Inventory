import { type System, type InsertSystem } from "@shared/schema";
import { supabase } from "./supabase";

export interface IStorage {
  getAllSystems(): Promise<System[]>;
  getSystemById(id: string): Promise<System | undefined>;
  getSystemsByIds(ids: string[]): Promise<System[]>;
  getSystemsByLab(labName: string): Promise<System[]>;
  getNextIdForLab(labName: string): Promise<string>;
  createSystem(system: InsertSystem): Promise<System>;
  createMultipleSystems(systems: InsertSystem[]): Promise<System[]>;
  updateSystem(id: string, system: Partial<InsertSystem>): Promise<System | undefined>;
  deleteSystem(id: string): Promise<boolean>;
  deleteSystems(ids: string[]): Promise<number>;
}

export class SupabaseStorage implements IStorage {
  async getAllSystems(): Promise<System[]> {
    const { data, error } = await supabase
      .from("systems")
      .select("*")
      .order("id_code", { ascending: true });

    if (error) {
      console.error("Error fetching systems:", error);
      throw new Error(`Failed to fetch systems: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToSystem(row));
  }

  async getSystemsStats(): Promise<{
    totalSystems: number;
    departmentCounts: Record<string, number>;
    configStats: Array<{
      configuration: string;
      count: number;
      departments: string[];
    }>;
  }> {
    const systems = await this.getAllSystems();
    
    const totalSystems = systems.length;
    
    // Count per department
    const departmentCounts = systems.reduce((acc, system) => {
      acc[system.labName] = (acc[system.labName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by configuration
    const configGroups = systems.reduce((acc, system) => {
      const config = system.description;
      if (!acc[config]) {
        acc[config] = [];
      }
      acc[config].push(system);
      return acc;
    }, {} as Record<string, System[]>);

    const configStats = Object.entries(configGroups).map(([config, systems]) => ({
      configuration: config,
      count: systems.length,
      departments: [...new Set(systems.map(s => s.labName))],
    })).sort((a, b) => b.count - a.count);

    return {
      totalSystems,
      departmentCounts,
      configStats,
    };
  }

  async getSystemById(id: string): Promise<System | undefined> {
    const { data, error } = await supabase
      .from("systems")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      console.error("Error fetching system:", error);
      throw new Error(`Failed to fetch system: ${error.message}`);
    }

    return data ? this.mapRowToSystem(data) : undefined;
  }

  async getSystemsByIds(ids: string[]): Promise<System[]> {
    const { data, error } = await supabase
      .from("systems")
      .select("*")
      .in("id", ids);

    if (error) {
      console.error("Error fetching systems by IDs:", error);
      throw new Error(`Failed to fetch systems: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToSystem(row));
  }

  async getSystemsByLab(labName: string): Promise<System[]> {
    const { data, error } = await supabase
      .from("systems")
      .select("*")
      .eq("lab_name", labName)
      .order("id_code", { ascending: true });

    if (error) {
      console.error("Error fetching systems by lab:", error);
      throw new Error(`Failed to fetch systems by lab: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToSystem(row));
  }

  async getNextIdForLab(labName: string): Promise<string> {
    const labSystems = await this.getSystemsByLab(labName);

    if (labSystems.length === 0) {
      return `${labName}-001`;
    }

    const lastId = labSystems[labSystems.length - 1].idCode;
    const lastNumber = parseInt(lastId.split("-")[1]);
    const nextNumber = lastNumber + 1;

    return `${labName}-${String(nextNumber).padStart(3, "0")}`;
  }

  async createSystem(insertSystem: InsertSystem): Promise<System> {
    const systemData = {
      id_code: insertSystem.idCode,
      lab_name: insertSystem.labName,
      description:
        insertSystem.description ||
        "INTEL CORE 2 DUO 2.90 GHZ, 4GB RAM, 360GB HDD, LED MONITOR, KB & MOUSE",
      qr_image_url: insertSystem.qrImageUrl || null,
      qr_payload: insertSystem.qrPayload || null,
      system_url: insertSystem.systemUrl || null,
    };

    const { data, error } = await supabase
      .from("systems")
      .insert([systemData])
      .select()
      .single();

    if (error) {
      console.error("Error creating system:", error);
      throw new Error(`Failed to create system: ${error.message}`);
    }

    return this.mapRowToSystem(data);
  }

  async createMultipleSystems(insertSystems: InsertSystem[]): Promise<System[]> {
    const systemsData = insertSystems.map((sys) => ({
      id_code: sys.idCode,
      lab_name: sys.labName,
      description:
        sys.description ||
        "INTEL CORE 2 DUO 2.90 GHZ, 4GB RAM, 360GB HDD, LED MONITOR, KB & MOUSE",
      qr_image_url: sys.qrImageUrl || null,
      qr_payload: sys.qrPayload || null,
      system_url: sys.systemUrl || null,
    }));

    const { data, error } = await supabase
      .from("systems")
      .insert(systemsData)
      .select();

    if (error) {
      console.error("Error creating multiple systems:", error);
      throw new Error(`Failed to create systems: ${error.message}`);
    }

    return (data || []).map((row) => this.mapRowToSystem(row));
  }

  async updateSystem(
    id: string,
    updates: Partial<InsertSystem>
  ): Promise<System | undefined> {
    const updateData: any = {};

    if (updates.idCode !== undefined) updateData.id_code = updates.idCode;
    if (updates.labName !== undefined) updateData.lab_name = updates.labName;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.qrImageUrl !== undefined) updateData.qr_image_url = updates.qrImageUrl;
    if (updates.qrPayload !== undefined) updateData.qr_payload = updates.qrPayload;
    if (updates.systemUrl !== undefined) updateData.system_url = updates.systemUrl;

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("systems")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") return undefined;
      console.error("Error updating system:", error);
      throw new Error(`Failed to update system: ${error.message}`);
    }

    return data ? this.mapRowToSystem(data) : undefined;
  }

  async deleteSystem(id: string): Promise<boolean> {
    const { error } = await supabase.from("systems").delete().eq("id", id);

    if (error) {
      console.error("Error deleting system:", error);
      throw new Error(`Failed to delete system: ${error.message}`);
    }

    return true;
  }

  async deleteSystems(ids: string[]): Promise<number> {
    // ✅ Fixed: removed invalid 2nd argument to `.select()`
    const { data, error } = await supabase
      .from("systems")
      .delete()
      .in("id", ids)
      .select("id");

    if (error) {
      console.error("Error deleting systems:", error);
      throw new Error(`Failed to delete systems: ${error.message}`);
    }

    return data?.length || ids.length;
  }

  private mapRowToSystem(row: any): System {
    return {
      id: row.id,
      idCode: row.id_code,
      labName: row.lab_name,
      description:
        row.description ||
        "INTEL CORE 2 DUO 2.90 GHZ, 4GB RAM, 360GB HDD, LED MONITOR, KB & MOUSE",
      qrImageUrl: row.qr_image_url,
      qrPayload: row.qr_payload,
      systemUrl: row.system_url,
      createdAt: row.created_at ? new Date(row.created_at) : null,
      updatedAt: row.updated_at ? new Date(row.updated_at) : null,
    };
  }
}

export const storage = new SupabaseStorage();
