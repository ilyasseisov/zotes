## data fetching

let blogPosts: Post[] = [];

try {
blogPosts = await fetchHandler<Post[]>(ENDPOINTS.ALL_POSTS);
} catch (error) {
console.error('Failed to fetch blog posts:', error);
throw new Error('Failed to fetch blog posts');
}

## data fetching with params

const Page = async ({ params }: { params: { slug: string } }) => {

// data fetching
const { slug } = await params;

let post: Post;

try {
post = await fetchHandler<Post>(ENDPOINTS.SINGLE_POST(slug));
} catch (error) {
console.error('Failed to fetch blog posts:', error);
throw new Error('Failed to fetch blog posts');
}

...
}
