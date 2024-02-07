interface  Gallery {
  proxy: string
  data: GalleryItem[]
}

interface GalleryItem {
  name: string
  folder: string
  sha: string
  size: number
  url: string
  width: number
  height: number
}

export {
  Gallery,
  GalleryItem
}

