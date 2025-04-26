const ENDPOINTS = {
  // ALL_POSTS: 'http://localhost:3000/api/posts',
  // SINGLE_POST: (slug: string) => `http://localhost:3000/api/posts/${slug}`,
};

export default ENDPOINTS;

// usage
// blogPosts = await fetchHandler<Post[]>(ENDPOINTS.ALL_POSTS);
// post = await fetchHandler<Post>(ENDPOINTS.SINGLE_POST(slug));
