const ROUTES = {
  APP: "/notes",
  NEW_NOTE: "/notes/new-note",
  SINGLE_NOTE: (id: string) => `/notes/note/${id}`,
};

export default ROUTES;

// usage
// <Link href={ROUTES.HOME}>
// <Link href={ROUTES.POST(post.slug)}>
