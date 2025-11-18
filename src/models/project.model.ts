import { pool } from '../config/database.config';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  stats: { [key: string]: string };
  technologies: string[];
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  displayOrder?: number;
}

export interface ProjectStat {
  id: string;
  projectId: string;
  statKey: string;
  statValue: string;
}

export interface ProjectTechnology {
  id: string;
  projectId: string;
  technology: string;
}

export class ProjectModel {
  static async getAll(): Promise<Project[]> {
    const query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.category,
        p.icon_name as "iconName",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        p.is_active as "isActive",
        p.display_order as "displayOrder"
      FROM projects p
      WHERE p.is_active = true
      ORDER BY p.display_order ASC, p.created_at DESC
    `;

    const result = await pool.query(query);
    const projects = result.rows;

    // Obtener estadísticas y tecnologías para cada proyecto
    for (const project of projects) {
      const stats = await this.getStatsByProjectId(project.id);
      const technologies = await this.getTechnologiesByProjectId(project.id);

      project.stats = {};
      stats.forEach(stat => {
        project.stats[stat.statKey] = stat.statValue;
      });

      project.technologies = technologies.map(t => t.technology);
    }

    return projects;
  }

  static async getById(id: string): Promise<Project | null> {
    const query = `
      SELECT 
        p.id,
        p.title,
        p.description,
        p.category,
        p.icon_name as "iconName",
        p.created_at as "createdAt",
        p.updated_at as "updatedAt",
        p.is_active as "isActive",
        p.display_order as "displayOrder"
      FROM projects p
      WHERE p.id = $1 AND p.is_active = true
    `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return null;
    }

    const project = result.rows[0];
    const stats = await this.getStatsByProjectId(project.id);
    const technologies = await this.getTechnologiesByProjectId(project.id);

    project.stats = {};
    stats.forEach(stat => {
      project.stats[stat.statKey] = stat.statValue;
    });

    project.technologies = technologies.map(t => t.technology);

    return project;
  }

  private static async getStatsByProjectId(projectId: string): Promise<ProjectStat[]> {
    const query = `
      SELECT id, project_id as "projectId", stat_key as "statKey", stat_value as "statValue"
      FROM project_stats
      WHERE project_id = $1
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  private static async getTechnologiesByProjectId(projectId: string): Promise<ProjectTechnology[]> {
    const query = `
      SELECT id, project_id as "projectId", technology
      FROM project_technologies
      WHERE project_id = $1
      ORDER BY technology ASC
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }
}

