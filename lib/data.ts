export type Product={id:number;slug:string;name:string;type?:string;price:string;regularPrice?:string;currency?:string;stockStatus?:string;stockQuantity?:number|null;shortDescription?:string;description?:string;image?:string|null;gallery?:string[];attributes?:{name:string;variation:boolean;options:string[]}[];variations?:{id:number;attributes:Record<string,string>;price:string;stockStatus:string;purchasable:boolean}[]};
export type Category={id:number;name:string;slug:string;count:number;parent:number};
export type WpPage={id:number;slug:string;title:string;content:string;excerpt?:string};
const base=process.env.WORDPRESS_URL?.replace(/\/$/,'');
export async function wp<T>(path:string,options?:{revalidate?:number}):Promise<T|null>{if(!base)return null;try{const response=await fetch(`${base}/wp-json/beyond-borders/v1${path}`,{next:{revalidate:options?.revalidate??120},headers:{Accept:'application/json'}});if(!response.ok)return null;return await response.json() as T}catch{return null}}
export async function products(page=1){return (await wp<{items:Product[];total:number;pages:number}>(`/products?page=${page}&per_page=24`,{revalidate:60}))??{items:[],total:0,pages:0}}
export async function categories(){return (await wp<Category[]>('/product-categories',{revalidate:300}))??[]}
export async function product(slug:string){return wp<Product>(`/products/${encodeURIComponent(slug)}`,{revalidate:60})}
export async function page(slug:string){return wp<WpPage>(`/pages/${encodeURIComponent(slug)}`,{revalidate:300})}
export const formatPrice=(n:string|number,currency='IRT',locale='fa')=>`${Number(n).toLocaleString(locale==='fa'?'fa-IR':'en-US')} ${currency==='IRR'?'ریال':currency==='IRT'?'تومان':currency}`;
