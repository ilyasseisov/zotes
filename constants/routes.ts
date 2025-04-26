const ROUTES = {
  HOME: "/",
  NEW_NOTE: "/new-note",
  SINGLE_NOTE: (id: string) => `/note/${id}`,
};

export default ROUTES;

// usage
// <Link href={ROUTES.HOME}>
// <Link href={ROUTES.POST(post.slug)}>
