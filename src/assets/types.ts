export interface CustomRoute {
  id: Number,
  name: string,
  path: string,
  component: object,
  external: Boolean,
}

export interface Project {
  id: Number,
  name: string,
  title: string,
  description: String,
  previewType: String,
  readMore: Boolean,
  component: object,
  readMoreComp: object,
}
