import { pool } from '../config/database.config';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  iconName: string;
  stats: { [key: string]: string };
  technologies: string[];
  details?: ProjectDetail[];
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

export interface ProjectDetail {
  id: string;
  projectId: string;
  projectDetail: string;
  displayOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
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
    const details = await this.getDetailsByProjectId(project.id);

    project.stats = {};
    stats.forEach(stat => {
      project.stats[stat.statKey] = stat.statValue;
    });

    project.technologies = technologies.map(t => t.technology);
    project.details = details;

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

  static async getDetailsByProjectId(projectId: string): Promise<ProjectDetail[]> {
    const query = `
      SELECT 
        id,
        project_id as "projectId",
        project_detail as "projectDetail",
        display_order as "displayOrder",
        created_at as "createdAt",
        updated_at as "updatedAt",
        is_active as "isActive"
      FROM projects_details
      WHERE project_id = $1 AND is_active = true
      ORDER BY display_order ASC, created_at ASC
    `;
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  // ========== CRUD Methods ==========

  static async create(projectData: {
    title: string;
    description: string;
    category: string;
    iconName: string;
    displayOrder?: number;
    stats?: { [key: string]: string };
    technologies?: string[];
  }): Promise<Project> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insertar proyecto
      const projectQuery = `
        INSERT INTO projects (title, description, category, icon_name, display_order)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING 
          id,
          title,
          description,
          category,
          icon_name as "iconName",
          created_at as "createdAt",
          updated_at as "updatedAt",
          is_active as "isActive",
          display_order as "displayOrder"
      `;
      const projectResult = await client.query(projectQuery, [
        projectData.title,
        projectData.description,
        projectData.category,
        projectData.iconName,
        projectData.displayOrder || 0
      ]);
      const project = projectResult.rows[0];

      // Insertar estadísticas si existen
      if (projectData.stats) {
        for (const [key, value] of Object.entries(projectData.stats)) {
          await client.query(
            `INSERT INTO project_stats (project_id, stat_key, stat_value)
             VALUES ($1, $2, $3)`,
            [project.id, key, value]
          );
        }
      }

      // Insertar tecnologías si existen
      if (projectData.technologies && projectData.technologies.length > 0) {
        for (const tech of projectData.technologies) {
          await client.query(
            `INSERT INTO project_technologies (project_id, technology)
             VALUES ($1, $2)
             ON CONFLICT (project_id, technology) DO NOTHING`,
            [project.id, tech]
          );
        }
      }

      await client.query('COMMIT');

      // Obtener el proyecto completo con relaciones
      const fullProject = await this.getById(project.id);
      return fullProject!;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(id: string, projectData: {
    title?: string;
    description?: string;
    category?: string;
    iconName?: string;
    displayOrder?: number;
    isActive?: boolean;
  }): Promise<Project | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (projectData.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(projectData.title);
    }
    if (projectData.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(projectData.description);
    }
    if (projectData.category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(projectData.category);
    }
    if (projectData.iconName !== undefined) {
      updates.push(`icon_name = $${paramCount++}`);
      values.push(projectData.iconName);
    }
    if (projectData.displayOrder !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(projectData.displayOrder);
    }
    if (projectData.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(projectData.isActive);
    }

    if (updates.length === 0) {
      return await this.getById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE projects
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        title,
        description,
        category,
        icon_name as "iconName",
        created_at as "createdAt",
        updated_at as "updatedAt",
        is_active as "isActive",
        display_order as "displayOrder"
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return null;
    }

    return await this.getById(id);
  }

  static async delete(id: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Eliminar estadísticas
      await client.query('DELETE FROM project_stats WHERE project_id = $1', [id]);
      
      // Eliminar tecnologías
      await client.query('DELETE FROM project_technologies WHERE project_id = $1', [id]);
      
      // Eliminar detalles
      await client.query('DELETE FROM projects_details WHERE project_id = $1', [id]);
      
      // Eliminar proyecto
      const result = await client.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);

      await client.query('COMMIT');
      return result.rows.length > 0;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Métodos para gestionar estadísticas
  static async updateStats(projectId: string, stats: { [key: string]: string }): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Eliminar estadísticas existentes
      await client.query('DELETE FROM project_stats WHERE project_id = $1', [projectId]);

      // Insertar nuevas estadísticas
      for (const [key, value] of Object.entries(stats)) {
        await client.query(
          `INSERT INTO project_stats (project_id, stat_key, stat_value)
           VALUES ($1, $2, $3)`,
          [projectId, key, value]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Métodos para gestionar tecnologías
  static async updateTechnologies(projectId: string, technologies: string[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Eliminar tecnologías existentes
      await client.query('DELETE FROM project_technologies WHERE project_id = $1', [projectId]);

      // Insertar nuevas tecnologías
      for (const tech of technologies) {
        await client.query(
          `INSERT INTO project_technologies (project_id, technology)
           VALUES ($1, $2)`,
          [projectId, tech]
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Métodos para gestionar detalles del proyecto
  static async createDetail(projectId: string, detailData: {
    projectDetail: string;
    displayOrder?: number;
  }): Promise<ProjectDetail> {
    const query = `
      INSERT INTO projects_details (project_id, project_detail, display_order)
      VALUES ($1, $2, $3)
      RETURNING 
        id,
        project_id as "projectId",
        project_detail as "projectDetail",
        display_order as "displayOrder",
        created_at as "createdAt",
        updated_at as "updatedAt",
        is_active as "isActive"
    `;
    const result = await pool.query(query, [
      projectId,
      detailData.projectDetail,
      detailData.displayOrder || 0
    ]);
    return result.rows[0];
  }

  static async updateDetail(detailId: string, detailData: {
    projectDetail?: string;
    displayOrder?: number;
    isActive?: boolean;
  }): Promise<ProjectDetail | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (detailData.projectDetail !== undefined) {
      updates.push(`project_detail = $${paramCount++}`);
      values.push(detailData.projectDetail);
    }
    if (detailData.displayOrder !== undefined) {
      updates.push(`display_order = $${paramCount++}`);
      values.push(detailData.displayOrder);
    }
    if (detailData.isActive !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(detailData.isActive);
    }

    if (updates.length === 0) {
      const query = `SELECT * FROM projects_details WHERE id = $1`;
      const result = await pool.query(query, [detailId]);
      return result.rows[0] || null;
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(detailId);

    const query = `
      UPDATE projects_details
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING 
        id,
        project_id as "projectId",
        project_detail as "projectDetail",
        display_order as "displayOrder",
        created_at as "createdAt",
        updated_at as "updatedAt",
        is_active as "isActive"
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  static async deleteDetail(detailId: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM projects_details WHERE id = $1 RETURNING id', [detailId]);
    return result.rows.length > 0;
  }

  static async updateAllDetails(projectId: string, details: Array<{
    id?: string;
    projectDetail: string;
    displayOrder: number;
  }>): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Eliminar detalles existentes que no están en la nueva lista
      const existingIds = details.filter(d => d.id).map(d => d.id);
      if (existingIds.length > 0) {
        await client.query(
          `DELETE FROM projects_details WHERE project_id = $1 AND id != ALL($2::uuid[])`,
          [projectId, existingIds]
        );
      } else {
        await client.query('DELETE FROM projects_details WHERE project_id = $1', [projectId]);
      }

      // Insertar o actualizar detalles
      for (const detail of details) {
        if (detail.id) {
          // Actualizar existente
          await client.query(
            `UPDATE projects_details 
             SET project_detail = $1, display_order = $2, updated_at = CURRENT_TIMESTAMP, is_active = true
             WHERE id = $3`,
            [detail.projectDetail, detail.displayOrder, detail.id]
          );
        } else {
          // Insertar nuevo
          await client.query(
            `INSERT INTO projects_details (project_id, project_detail, display_order)
             VALUES ($1, $2, $3)`,
            [projectId, detail.projectDetail, detail.displayOrder]
          );
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

