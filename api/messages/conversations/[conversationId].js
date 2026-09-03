const prisma = require('../../_lib/prisma');
const { handleCors } = require('../../_lib/cors');
const { requireAuth } = require('../../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const { conversationId } = req.query;

  if (!conversationId) {
    return res.status(400).json({ success: false, error: { message: 'Conversation ID is required' } });
  }

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: auth.userId },
          { participant2Id: auth.userId }
        ]
      }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, error: { message: 'Conversation not found or access denied' } });
    }

    if (req.method === 'GET') {
      const { page = 1, limit = 50 } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);

      const [messages, total] = await Promise.all([
        prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'desc' },
          skip,
          take
        }),
        prisma.message.count({ where: { conversationId } })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          messages: messages.reverse(),
          pagination: {
            page: parseInt(page),
            limit: take,
            total,
            pages: Math.ceil(total / take)
          }
        },
        messages: messages.reverse()
      });

    } else if (req.method === 'POST') {
      const { content } = req.body || {};

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: { message: 'Message content is required' } });
      }

      const message = await prisma.message.create({
        data: {
          content: content.trim(),
          conversationId,
          senderId: auth.userId
        }
      });

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
      });

      const sender = await prisma.user.findUnique({
        where: { id: auth.userId },
        select: { id: true, name: true, username: true, avatar: true }
      });

      const recipientId = conversation.participant1Id === auth.userId
        ? conversation.participant2Id
        : conversation.participant1Id;

      try {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: 'message',
            title: 'New Message',
            message: `${sender.name} sent you a message`,
            link: `/messages?conversation=${conversationId}`,
            metadata: { conversationId, senderId: auth.userId, senderName: sender.name }
          }
        });
      } catch (e) {}

      return res.status(201).json({
        success: true,
        data: { ...message, sender }
      });

    } else if (req.method === 'DELETE') {
      await prisma.conversation.delete({ where: { id: conversationId } });

      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully'
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Conversation [conversationId] API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};
