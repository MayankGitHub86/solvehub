const prisma = require('../_lib/prisma');
const { handleCors } = require('../_lib/cors');
const { requireAuth } = require('../_lib/auth');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  const auth = requireAuth(req, res);
  if (!auth) return;

  try {
    if (req.method === 'GET') {
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { participant1Id: auth.userId },
            { participant2Id: auth.userId }
          ]
        },
        include: {
          participant1: {
            select: { id: true, name: true, username: true, avatar: true, isOnline: true }
          },
          participant2: {
            select: { id: true, name: true, username: true, avatar: true, isOnline: true }
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { lastMessageAt: 'desc' }
      });

      const formatted = await Promise.all(
        conversations.map(async (conv) => {
          const otherUser = conv.participant1Id === auth.userId ? conv.participant2 : conv.participant1;

          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: auth.userId },
              isRead: false
            }
          });

          return {
            id: conv.id,
            otherUser,
            lastMessage: conv.messages[0] || null,
            lastMessageAt: conv.lastMessageAt,
            unreadCount,
            createdAt: conv.createdAt
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: formatted
      });

    } else if (req.method === 'POST') {
      const { userId } = req.body || {};

      if (!userId) {
        return res.status(400).json({ success: false, error: { message: 'User ID is required' } });
      }

      if (userId === auth.userId) {
        return res.status(400).json({ success: false, error: { message: 'Cannot create conversation with yourself' } });
      }

      let conversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            { participant1Id: auth.userId, participant2Id: userId },
            { participant1Id: userId, participant2Id: auth.userId }
          ]
        },
        include: {
          participant1: { select: { id: true, name: true, username: true, avatar: true } },
          participant2: { select: { id: true, name: true, username: true, avatar: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 }
        }
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            participant1Id: auth.userId,
            participant2Id: userId
          },
          include: {
            participant1: { select: { id: true, name: true, username: true, avatar: true } },
            participant2: { select: { id: true, name: true, username: true, avatar: true } },
            messages: true
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: conversation
      });

    } else {
      return res.status(405).json({ success: false, error: { message: 'Method not allowed' } });
    }

  } catch (error) {
    console.error('Conversations API error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal server error' } });
  }
};
