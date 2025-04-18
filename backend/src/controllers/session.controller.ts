import { Request, Response } from 'express';
import { SessionService } from '../services/session.service';

export class SessionController {
  static async createSession(req: Request, res: Response): Promise<void> {
    try {
      const session = req.body;
      const result = await SessionService.createSession(session);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ error: 'Failed to create session' });
    }
  }
  
  static async updateSession(req: Request, res: Response): Promise<void> {
    try {
      const session = req.body;
      const result = await SessionService.updateSession(session);
      
      if (!result) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({ error: 'Failed to update session' });
    }
  }
  
  static async getAllSessions(req: Request, res: Response): Promise<void> {
    try {
      // Get pagination parameters from query string with defaults
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 1000;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      
      const sessions = await SessionService.getAllSessions(limit, offset);
      res.status(200).json(sessions);
    } catch (error) {
      console.error('Error fetching all sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }
  
  static async getActiveSessions(req: Request, res: Response): Promise<void> {
    try {
      const activeSessions = await SessionService.getActiveSessions();
      res.status(200).json(activeSessions);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      res.status(500).json({ error: 'Failed to fetch active sessions' });
    }
  }
  
  static async getSessionsByStudentId(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const sessions = await SessionService.getSessionsByStudentId(studentId);
      res.status(200).json(sessions);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      res.status(500).json({ error: 'Failed to fetch sessions' });
    }
  }
  
  static async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const session = await SessionService.getSessionById(sessionId);
      
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }
      
      res.status(200).json(session);
    } catch (error) {
      console.error('Error fetching session:', error);
      res.status(500).json({ error: 'Failed to fetch session' });
    }
  }
}