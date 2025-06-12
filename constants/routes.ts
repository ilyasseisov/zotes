const ROUTES = {
  LANDING_PAGE: "/",
  APP: "/notes",
  NEW_NOTE: "/notes/new-note",
  SINGLE_NOTE: (id: string) => `/notes/note/${id}`,
  //
  SIGN_IN: "/notes/sign-in",
  SIGN_UP: "/notes/sign-up",
};

export default ROUTES;

// usage
// <Link href={ROUTES.HOME}>
// <Link href={ROUTES.POST(post.slug)}>
