
export type ProductAttribute = {
  name: string;
  variation: boolean;
  options: string[];
};

export type ProductVariation = {
  id: number;
  attributes: Record<string, string>;
  price: string;
  stockStatus: string;
  purchasable: boolean;
};

export type Product = {
  id: number;
  slug: string;
  name: string;
  type?: string;
  price: string;
  regularPrice?: string;
  currency?: string;
  stockStatus?: string;
  stockQuantity?: number | null;
  shortDescription?: string;
  description?: string;
  image?: string | null;
  gallery?: string[];
  attributes?: ProductAttribute[];
  variations?: ProductVariation[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  count: number;
  parent: number;
};

export type WpPage = {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
};

type ProductsResponse = {
  items: Product[];
  total: number;
  pages: number;
};

const base = process.env.WORDPRESS_URL?.replace(/\/+$/, "");

// Decode encoded Persian slugs safely.
function normalizeSlug(value: string): string {
  let decoded = value;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep original value if decoding fails.
  }

  return decoded.normalize("NFC").trim().toLowerCase();
}

// Convert API product data to the format expected by Next.js.
function normalizeProduct(raw: Product): Product {
  const source = raw as Product & {
    attributes?:
      | ProductAttribute[]
      | Record<string, ProductAttribute>;
  };

  const attributes = Array.isArray(source.attributes)
    ? source.attributes
    : source.attributes &&
        typeof source.attributes === "object"
      ? Object.values(source.attributes)
      : [];

  return {
    ...raw,
    attributes,
    gallery: Array.isArray(raw.gallery)
      ? raw.gallery
      : [],
    variations: Array.isArray(raw.variations)
      ? raw.variations
      : [],
  };
}

// General WordPress API request.
export async function wp<T>(
  path: string,
  options?: { revalidate?: number }
): Promise<T | null> {
  if (!base) {
    console.error(
      "[WP] WORDPRESS_URL is missing in .env.local"
    );
    return null;
  }

  const url = `${base}/wp-json/beyond-borders/v1${path}`;

  try {
    console.log("[WP] Request:", url);

    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    console.log("[WP] Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();

      console.warn(
        `[WP] HTTP ${response.status}:`,
        url,
        errorText.slice(0, 300)
      );

      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(
      "[WP] Connection failed:",
      url,
      error
    );

    return null;
  }
}

// Get product list.
export async function products(
  page = 1
): Promise<ProductsResponse> {
  const result = await wp<unknown>(
    `/products?page=${page}&per_page=24`
  );

  let items: Product[] = [];
  let total = 0;
  let pages = 0;

  if (Array.isArray(result)) {
    items = result as Product[];
    total = items.length;
    pages = 1;
  } else if (
    result &&
    typeof result === "object" &&
    "items" in result &&
    Array.isArray(result.items)
  ) {
    const data = result as ProductsResponse;

    items = data.items;
    total = Number(data.total ?? items.length);
    pages = Number(data.pages ?? 1);
  } else {
    console.warn(
      "[WP] Unexpected products response:",
      result
    );
  }

  return {
    items: items.map(normalizeProduct),
    total,
    pages,
  };
}

// Get product categories.
export async function categories(): Promise<Category[]> {
  const result = await wp<unknown>(
    "/product-categories"
  );

  return Array.isArray(result)
    ? (result as Category[])
    : [];
}

// Get a product by slug or ID.
//
// The detail endpoint currently returns 404,
// so use the working product-list endpoint instead.
export async function product(
  slug: string
): Promise<Product | null> {
  const requestedSlug = normalizeSlug(slug);

  console.log(
    "[WP] Looking for product:",
    requestedSlug
  );

  const firstPage = await products(1);

  const findProduct = (items: Product[]) =>
    items.find(
      (item) =>
        normalizeSlug(item.slug) === requestedSlug ||
        String(item.id) === slug
    );

  const firstMatch = findProduct(firstPage.items);

  if (firstMatch) {
    console.log(
      "[WP] Product found:",
      firstMatch.name
    );

    return firstMatch;
  }

  // Search remaining pages if the catalog grows.
  for (let pageNumber = 2; pageNumber <= firstPage.pages; pageNumber++) {
    const nextPage = await products(pageNumber);
    const match = findProduct(nextPage.items);

    if (match) {
      console.log(
        "[WP] Product found:",
        match.name
      );

      return match;
    }
  }

  console.warn(
    "[WP] Product not found:",
    slug
  );

  return null;
}

// Get a WordPress page.
export async function page(
  slug: string
): Promise<WpPage | null> {
  const encodedSlug = encodeURIComponent(
    normalizeSlug(slug)
  );

  return wp<WpPage>(
    `/pages/${encodedSlug}`
  );
}

// Format product prices.
export const formatPrice = (
  n: string | number,
  currency = "IRT",
  locale = "fa"
): string => {
  const amount = Number(n);

  const formatted = Number.isFinite(amount)
    ? amount.toLocaleString(
        locale === "fa" ? "fa-IR" : "en-US"
      )
    : String(n);

  const currencyLabel =
    currency === "IRR"
      ? "ریال"
      : currency === "IRT"
        ? "تومان"
        : currency;

  return `${formatted} ${currencyLabel}`;
};
