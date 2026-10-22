
import { notFound } from "next/navigation";
import { products, categories } from "@/lib/data";
import { getLocale } from "@/lib/i18n";
import { ShopGrid } from "@/components/shop-grid";

type CategoryPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

function normalizeSlug(value: string): string {
  let decoded = value;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    // Keep the original slug if decoding fails.
  }

  return decoded
    .normalize("NFC")
    .trim()
    .toLowerCase();
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { locale: localeParam, slug } = await params;

  const locale = getLocale(localeParam);

  const [cats, data] = await Promise.all([
    categories(),
    products(),
  ]);

  const normalizedSlug = normalizeSlug(slug);

  const cat = cats.find(
    (category) =>
      normalizeSlug(category.slug) === normalizedSlug
  );

  if (!cat) {
    console.warn("[Category] Category not found:", {
      requestedSlug: slug,
      availableSlugs: cats.map((c) => c.slug),
    });

    // A missing category should return a real 404.
    // If the categories API is unavailable, keep
    // the page accessible for debugging.
    if (cats.length > 0) {
      notFound();
    }
  }

  const categorySlug = cat?.slug ?? slug;

  return (
    <div className="page-wrap">
      <div className="page-heading">
        <p className="eyebrow">PAPER / COLLECTION</p>

        <h1>
          {cat?.name ?? normalizeSlug(slug)}
          <span className="dot">.</span>
        </h1>
      </div>

      <ShopGrid
        locale={locale}
        categories={cats}
        initialCategory={categorySlug}
        items={data.items}
      />

      <p className="micro">
        {locale === "fa"
          ? "توجه: فیلتر دقیق دسته‌بندی پس از توسعه API دسته‌بندی در Beyond Borders فعال می‌شود؛ محصولات نمایش‌داده‌شده فعلاً از فهرست عمومی هستند."
          : "Category-specific server filtering requires an API extension; currently showing the general catalog."}
      </p>
    </div>
  );
}
