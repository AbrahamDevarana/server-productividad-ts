export const getStorageUrl = (file?: string) => {
    if(file) return `${process.env.DIGITALOCEAN_CDN}${process.env.DIGITALOCEAN_STORAGE}/${file}`
}