import { Star, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/auth";
import { toast } from "sonner";

export function ReviewsSection() {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    text: "",
    role: "",
  });

  // Fetch reviews
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/reviews`);
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to add a review");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Review submitted successfully!");
        setIsDialogOpen(false);
        setFormData({ rating: 5, text: "", role: "" });
        fetchReviews();
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error("Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const paginate = (newDirection: number) => {
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = reviews.length - 1;
      if (nextIndex >= reviews.length) nextIndex = 0;
      return nextIndex;
    });
  };

  // Calculate visible reviews (current + 2 more)
  const visibleReviews = reviews.length > 0 ? [
    reviews[currentIndex],
    reviews[(currentIndex + 1) % reviews.length],
    reviews[(currentIndex + 2) % reviews.length],
  ].filter(Boolean) : [];

  if (reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  return (
    <section className="relative py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Loved by <span className="gradient-text">Students & Educators</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-6">
            See what our community has to say about their experience.
          </p>
          <Button 
            variant="outline" 
            className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-primary/10 border-primary/20"
            onClick={() => {
              if (!user) {
                toast.error("Please login to add a review");
                return;
              }
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" />
            Add Your Review
          </Button>
        </motion.div>

        {/* Add Review Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Your Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitReview} className="space-y-4 mt-4">
              {/* Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="text-sm font-medium mb-2 block">Your Role</label>
                <Input
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g., Computer Science Student, Professor, etc."
                  required
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="text-sm font-medium mb-2 block">Your Review</label>
                <Textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Share your experience with SolveHub..."
                  rows={5}
                  required
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reviews Carousel */}
        <div className="relative max-w-7xl mx-auto">
          {/* Navigation Buttons */}
          {reviews.length > 3 && (
            <>
              <button
                onClick={() => paginate(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-primary/20 hover:bg-primary/30 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-primary" />
              </button>

              <button
                onClick={() => paginate(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-primary/20 hover:bg-primary/30 backdrop-blur-sm flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-primary" />
              </button>
            </>
          )}

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-16">
            {visibleReviews.map((review, index) => (
              <motion.div
                key={review.id}
                className="glass rounded-2xl p-6 relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted"
                      }`}
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-muted-foreground mb-6 line-clamp-4">
                  "{review.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={review.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.username}`}
                    alt={review.user?.name}
                    className="w-12 h-12 rounded-full ring-2 ring-primary/20"
                  />
                  <div>
                    <div className="font-semibold text-foreground">
                      {review.user?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {review.role}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination Dots */}
          {reviews.length > 3 && (
            <div className="flex justify-center gap-2 mt-8">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted hover:bg-muted-foreground"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
