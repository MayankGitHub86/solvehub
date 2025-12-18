import { Response, Request } from 'express';

type Client = {
  id: string;
  res: Response;
  userId?: string;
};

export type NotificationEvent = {
  type:
    | 'health'
    | 'question:new'
    | 'answer:new'
    | 'answer:accepted'
    | 'vote:received'
    | 'comment:new';
  message: string;
  data?: any;
  targetUserId?: string;
};

class NotificationService {
  private clients: Client[] = [];

  subscribe(req: Request, res: Response, userId?: string) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const client: Client = { id, res, userId };
    this.clients.push(client);

    // Send initial heartbeat
    this.send(client.res, { type: 'health', message: 'connected' });

    req.on('close', () => {
      this.clients = this.clients.filter((c) => c.id !== id);
    });
  }

  notify(event: NotificationEvent) {
    const payload = `data: ${JSON.stringify(event)}\n\n`;
    const targets = event.targetUserId
      ? this.clients.filter((c) => c.userId === event.targetUserId)
      : this.clients;
    targets.forEach((c) => c.res.write(payload));
  }

  private send(res: Response, event: NotificationEvent) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }
}

export const notifications = new NotificationService();
