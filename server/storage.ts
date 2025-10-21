import { type System, type InsertSystem } from "@shared/schema";

export interface IStorage {
  getAllSystems(): Promise<System[]>;
  getSystemById(id: string): Promise<System | undefined>;
  getSystemsByLab(labName: string): Promise<System[]>;
  getNextIdForLab(labName: string): Promise<string>;
  createSystem(system: InsertSystem): Promise<System>;
  createMultipleSystems(systems: InsertSystem[]): Promise<System[]>;
  updateSystem(id: string, system: Partial<InsertSystem>): Promise<System | undefined>;
  deleteSystem(id: string): Promise<boolean>;
  deleteSystems(ids: string[]): Promise<number>;
}

export class MemStorage implements IStorage {
  private systems: Map<string, System>;

  constructor() {
    this.systems = new Map();
  }

  async getAllSystems(): Promise<System[]> {
    return Array.from(this.systems.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getSystemById(id: string): Promise<System | undefined> {
    return this.systems.get(id);
  }

  async getSystemsByLab(labName: string): Promise<System[]> {
    return Array.from(this.systems.values())
      .filter((system) => system.labName === labName)
      .sort((a, b) => a.idCode.localeCompare(b.idCode));
  }

  async getNextIdForLab(labName: string): Promise<string> {
    const labSystems = await this.getSystemsByLab(labName);
    if (labSystems.length === 0) {
      return `${labName}-001`;
    }
    
    const lastId = labSystems[labSystems.length - 1].idCode;
    const lastNumber = parseInt(lastId.split('-')[1]);
    const nextNumber = lastNumber + 1;
    return `${labName}-${String(nextNumber).padStart(3, '0')}`;
  }

  async createSystem(insertSystem: InsertSystem): Promise<System> {
    const id = crypto.randomUUID();
    const now = new Date();
    const system: System = {
      id,
      idCode: insertSystem.idCode,
      labName: insertSystem.labName,
      description: insertSystem.description || "INTEL CORE 2 DUO 2.90 GHZ, 4GB RAM, 360GB HDD, LED MONITOR, KB & MOUSE",
      qrImageUrl: insertSystem.qrImageUrl || null,
      qrPayload: insertSystem.qrPayload || null,
      systemUrl: insertSystem.systemUrl || null,
      createdAt: now,
      updatedAt: now,
    };
    this.systems.set(id, system);
    return system;
  }

  async createMultipleSystems(insertSystems: InsertSystem[]): Promise<System[]> {
    const created: System[] = [];
    for (const insertSystem of insertSystems) {
      const system = await this.createSystem(insertSystem);
      created.push(system);
    }
    return created;
  }

  async updateSystem(id: string, updates: Partial<InsertSystem>): Promise<System | undefined> {
    const existing = this.systems.get(id);
    if (!existing) {
      return undefined;
    }
    
    const updated: System = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.systems.set(id, updated);
    return updated;
  }

  async deleteSystem(id: string): Promise<boolean> {
    return this.systems.delete(id);
  }

  async deleteSystems(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      if (this.systems.delete(id)) {
        count++;
      }
    }
    return count;
  }
}

export const storage = new MemStorage();
