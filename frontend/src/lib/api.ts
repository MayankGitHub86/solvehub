const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class ApiService {
  private getHeaders(requiresAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = false, ...fetchOptions } = options;

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers: {
          ...this.getHeaders(requiresAuth),
          ...fetchOptions.headers,
        },
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response. Backend might not be running correctly.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'An error occurred');
      }

      return data;
    } catch (error: any) {
      // If it's a network error
      if (error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if backend is running on port 3001.');
      }
      throw error;
    }
  }

  // Auth
  async register(userData: {
    email: string;
    username: string;
    name: string;
    password: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // Users
  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    minPoints?: number;
  }) {
    // Filter out undefined values to prevent "undefined" string in URL
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          cleanParams[key] = String(value);
        }
      });
    }
    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/users?${query}`);
  }

  async searchUsers(query: string) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`);
  }

  async getLeaderboard(period?: string) {
    return this.request(`/users/leaderboard?period=${period || 'all'}`);
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  async getUserStats(id: string) {
    return this.request(`/users/${id}/stats`);
  }

  async updateUser(id: string, data: { name?: string; bio?: string; avatar?: string }) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async getSavedQuestions(userId: string) {
    return this.request(`/users/${userId}/saved`, {
      requiresAuth: true,
    });
  }

  // Questions
  async getAllQuestions(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
  }) {
    // Filter out undefined values to prevent "undefined" string in URL
    const cleanParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          cleanParams[key] = String(value);
        }
      });
    }
    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/questions?${query}`);
  }

  async getTrendingQuestions(period?: string) {
    return this.request(`/questions/trending?period=${period || 'week'}`);
  }

  async getQuestionById(id: string) {
    return this.request(`/questions/${id}`);
  }

  async createQuestion(data: {
    title: string;
    content: string;
    tags: string[];
  }) {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async updateQuestion(id: string, data: { title: string; content: string }) {
    return this.request(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async deleteQuestion(id: string) {
    return this.request(`/questions/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  async saveQuestion(id: string) {
    return this.request(`/questions/${id}/save`, {
      method: 'POST',
      requiresAuth: true,
    });
  }

  async unsaveQuestion(id: string) {
    return this.request(`/questions/${id}/save`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  // Answers
  async getAnswersByQuestionId(questionId: string) {
    return this.request(`/answers/question/${questionId}`);
  }

  async createAnswer(data: { content: string; questionId: string }) {
    return this.request('/answers', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async updateAnswer(id: string, content: string) {
    return this.request(`/answers/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
      requiresAuth: true,
    });
  }

  async deleteAnswer(id: string) {
    return this.request(`/answers/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  async acceptAnswer(id: string) {
    return this.request(`/answers/${id}/accept`, {
      method: 'POST',
      requiresAuth: true,
    });
  }

  // Tags
  async getAllTags() {
    return this.request('/tags');
  }

  async getPopularTags() {
    return this.request('/tags/popular');
  }

  async getQuestionsByTag(tagId: string, params?: { page?: number; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/tags/${tagId}/questions?${query}`);
  }

  // Votes
  async vote(data: {
    value: 1 | -1;
    questionId?: string;
    answerId?: string;
  }) {
    return this.request('/votes', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async getUserVote(questionId?: string, answerId?: string) {
    const params = new URLSearchParams();
    if (questionId) params.append('questionId', questionId);
    if (answerId) params.append('answerId', answerId);
    return this.request(`/votes/user?${params.toString()}`, {
      requiresAuth: true,
    });
  }

  async getVoteStats(questionId?: string, answerId?: string) {
    const params = new URLSearchParams();
    if (questionId) params.append('questionId', questionId);
    if (answerId) params.append('answerId', answerId);
    return this.request(`/votes/stats?${params.toString()}`);
  }

  // Search
  async advancedSearch(params: {
    q?: string;
    tags?: string;
    author?: string;
    status?: 'solved' | 'unsolved' | 'all';
    sort?: 'recent' | 'votes' | 'views' | 'answers';
    minVotes?: number;
    maxVotes?: number;
    minAnswers?: number;
    maxAnswers?: number;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const cleanParams: Record<string, string> = {};
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = String(value);
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    return this.request(`/search?${query}`);
  }

  async getSearchSuggestions(query: string) {
    return this.request(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }

  async getPopularSearches() {
    return this.request('/search/popular');
  }

  // Comments
  async createComment(data: {
    content: string;
    questionId?: string;
    answerId?: string;
  }) {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async updateComment(id: string, content: string) {
    return this.request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
      requiresAuth: true,
    });
  }

  async deleteComment(id: string) {
    return this.request(`/comments/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  // Collections
  async getUserCollections() {
    return this.request('/collections', {
      requiresAuth: true,
    });
  }

  async createCollection(data: { name: string; description?: string }) {
    return this.request('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async updateCollection(id: string, data: { name?: string; description?: string }) {
    return this.request(`/collections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      requiresAuth: true,
    });
  }

  async deleteCollection(id: string) {
    return this.request(`/collections/${id}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  async getCollectionQuestions(id: string) {
    return this.request(`/collections/${id}/questions`, {
      requiresAuth: true,
    });
  }

  async addQuestionToCollection(collectionId: string, questionId: string) {
    return this.request(`/collections/${collectionId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ questionId }),
      requiresAuth: true,
    });
  }

  async removeQuestionFromCollection(collectionId: string, questionId: string) {
    return this.request(`/collections/${collectionId}/questions/${questionId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  // Achievements
  async getAllBadges() {
    return this.request('/achievements/badges');
  }

  async getUserBadges(userId: string) {
    return this.request(`/achievements/badges/user/${userId}`);
  }

  async getBadgeProgress() {
    return this.request('/achievements/progress', {
      requiresAuth: true,
    });
  }

  async checkBadges() {
    return this.request('/achievements/check', {
      method: 'POST',
      requiresAuth: true,
    });
  }

  // AI Services
  async checkAIAvailability() {
    return this.request('/ai/availability');
  }

  async suggestAnswer(questionId: string) {
    return this.request(`/ai/suggest-answer/${questionId}`, {
      method: 'POST',
      requiresAuth: true,
    });
  }

  async suggestTags(title: string, content: string) {
    return this.request('/ai/suggest-tags', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
      requiresAuth: true,
    });
  }

  async findSimilarQuestions(title: string, content?: string) {
    return this.request('/ai/find-similar', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
      requiresAuth: true,
    });
  }

  async improveQuestion(title: string, content: string) {
    return this.request('/ai/improve-question', {
      method: 'POST',
      body: JSON.stringify({ title, content }),
      requiresAuth: true,
    });
  }

  // Follow System
  async followUser(userId: string) {
    return this.request(`/users/${userId}/follow`, {
      method: 'POST',
      requiresAuth: true,
    });
  }

  async unfollowUser(userId: string) {
    return this.request(`/users/${userId}/follow`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  async getFollowers(userId: string, page: number = 1, limit: number = 20) {
    return this.request(`/users/${userId}/followers?page=${page}&limit=${limit}`);
  }

  async getFollowing(userId: string, page: number = 1, limit: number = 20) {
    return this.request(`/users/${userId}/following?page=${page}&limit=${limit}`);
  }

  async getFollowStatus(userId: string) {
    return this.request(`/users/${userId}/follow/status`, {
      requiresAuth: true,
    });
  }

  async getFollowStats(userId: string) {
    return this.request(`/users/${userId}/follow/stats`);
  }

  // Messaging
  async getConversations() {
    return this.request('/messages/conversations', {
      requiresAuth: true,
    });
  }

  async getOrCreateConversation(userId: string) {
    return this.request('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify({ userId }),
      requiresAuth: true,
    });
  }

  async getMessages(conversationId: string, page: number = 1, limit: number = 50) {
    return this.request(`/messages/conversations/${conversationId}?page=${page}&limit=${limit}`, {
      requiresAuth: true,
    });
  }

  async sendMessage(conversationId: string, content: string) {
    return this.request(`/messages/conversations/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
      requiresAuth: true,
    });
  }

  async markMessagesAsRead(conversationId: string) {
    return this.request(`/messages/conversations/${conversationId}/read`, {
      method: 'PUT',
      requiresAuth: true,
    });
  }

  async getUnreadMessageCount() {
    return this.request('/messages/unread-count', {
      requiresAuth: true,
    });
  }

  async deleteConversation(conversationId: string) {
    return this.request(`/messages/conversations/${conversationId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  // User Profile
  async getUserByUsername(username: string) {
    return this.request(`/users/username/${username}`);
  }

  async getUserQuestions(userId: string) {
    return this.request(`/users/${userId}/questions`);
  }

  async getUserAnswers(userId: string) {
    return this.request(`/users/${userId}/answers`);
  }

  // Notifications
  async getNotifications(page = 1, limit = 20) {
    return this.request(`/notifications?page=${page}&limit=${limit}`, {
      requiresAuth: true,
    });
  }

  async getUnreadNotificationCount() {
    return this.request('/notifications/unread-count', {
      requiresAuth: true,
    });
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      requiresAuth: true,
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
      requiresAuth: true,
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
      requiresAuth: true,
    });
  }

  async deleteAllNotifications() {
    return this.request('/notifications', {
      method: 'DELETE',
      requiresAuth: true,
    });
  }
}

export const api = new ApiService();
export default api;
