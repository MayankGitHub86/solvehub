const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ReviewController {
  /**
   * Get all reviews
   */
  async getAllReviews(req, res) {
    try {
      const reviews = await prisma.review.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json({ data: reviews });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  }

  /**
   * Create a new review
   */
  async createReview(req, res) {
    try {
      const { rating, text, role } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!rating || !text) {
        return res.status(400).json({ error: 'Rating and text are required' });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }

      // Check if user already has a review
      const existingReview = await prisma.review.findUnique({
        where: { userId },
      });

      if (existingReview) {
        return res.status(400).json({ 
          error: 'You have already submitted a review. You can edit your existing review.' 
        });
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          userId,
          rating,
          text,
          role: role || 'Student',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      res.status(201).json({ data: review });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }

  /**
   * Update a review
   */
  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { rating, text, role } = req.body;
      const userId = req.user.id;

      // Check if review exists and belongs to user
      const existingReview = await prisma.review.findUnique({
        where: { id },
      });

      if (!existingReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      if (existingReview.userId !== userId) {
        return res.status(403).json({ error: 'You can only edit your own review' });
      }

      // Update review
      const review = await prisma.review.update({
        where: { id },
        data: {
          rating: rating || existingReview.rating,
          text: text || existingReview.text,
          role: role || existingReview.role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      res.json({ data: review });
    } catch (error) {
      console.error('Error updating review:', error);
      res.status(500).json({ error: 'Failed to update review' });
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if review exists and belongs to user
      const existingReview = await prisma.review.findUnique({
        where: { id },
      });

      if (!existingReview) {
        return res.status(404).json({ error: 'Review not found' });
      }

      if (existingReview.userId !== userId) {
        return res.status(403).json({ error: 'You can only delete your own review' });
      }

      // Delete review
      await prisma.review.delete({
        where: { id },
      });

      res.json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error('Error deleting review:', error);
      res.status(500).json({ error: 'Failed to delete review' });
    }
  }

  /**
   * Get user's review
   */
  async getUserReview(req, res) {
    try {
      const userId = req.user.id;

      const review = await prisma.review.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

      if (!review) {
        return res.status(404).json({ error: 'No review found' });
      }

      res.json({ data: review });
    } catch (error) {
      console.error('Error fetching user review:', error);
      res.status(500).json({ error: 'Failed to fetch review' });
    }
  }
}

module.exports = new ReviewController();
