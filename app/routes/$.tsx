import {
  json,
  type HeadersFunction,
  type MetaFunction,
  type LoaderFunctionArgs,
  type LoaderFunction,
} from "@remix-run/node";
import { getStoryblokApi } from "@storyblok/react";
import { useStoryblokData } from "~/hooks";
import { implementSeo, getPostCardData, invariantResponse } from "~/utils";
import type { PostStoryblok } from "~/types";
import { useParams } from "@remix-run/react";
import { GeneralErrorBoundary } from "~/components/GeneralErrorBoundary";
import { NotFoundPage } from "~/components/NotFoundPage";
import { cacheControl } from "~/utils/cacheControl";

export const loader: LoaderFunction = async ({
  params,
  request,
}: LoaderFunctionArgs) => {
  let slug = params["*"] ?? "home";
  let url = new URL(request.url);
  url = url.href; // This gives you the full URL string

  const sbApi = getStoryblokApi();

  const resolveRelations = ["post.categories"];

  const { data }: { data: any } = await sbApi
    .get(`cdn/stories/${slug}`, {
      version: "draft",
    })
    .catch((e) => {
      console.log("e", e);
      return { data: null };
    });
  invariantResponse(data, `there is no page with slug ${slug}`, {
    status: 404,
  });
  let headers = {
    ...cacheControl,
  };
  const numberOfPosts = data.story.content.body?.find(
    (item: { component: string }) => item.component === "last-posts"
  )?.number_of_posts;

  const { data: lastPosts } = await sbApi.get(`cdn/stories`, {
    version: "draft",
    starts_with: "blog/",
    per_page: numberOfPosts,
    is_startpage: false,
    resolve_relations: resolveRelations,
  });
  const story = data?.story;

  const seo = story?.content?.seo_plugin?.title
    ? story?.content?.seo_plugin
    : story?.content?.seo[0];
  const noFollow = story?.content?.seo[0]?.no_follow;

  return json(
    {
      blok: story.content,
      name: story.name,
      lastPosts: lastPosts?.stories?.map((p: PostStoryblok) =>
        getPostCardData(p)
      ),
      seo,
      url,
      noFollow,
    },
    { headers }
  );
};

export let headers: HeadersFunction = ({ loaderHeaders }) => {
  return { "Cache-Control": loaderHeaders.get("Cache-Control") };
};

export const meta: MetaFunction = ({ data }: { data: any }) => {
  return [
    ...implementSeo(data?.seo, data?.name),
    {
      "script:ld+json": {
        "@context": "https://schema.org",
        "@type": "WebPage",
        url: `${data.url}`,
      },
    },
    data.noFollow && {
      name: "robots",
      content: "noindex, nofollow",
    },
  ];
};

const RootPage = () => {
  const params = useParams();
  const routeFile = params["*"] === undefined ? "routes/_index" : "routes/$";
  const data = useStoryblokData(routeFile);

  return data;
};

export default RootPage;

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        404: () => <NotFoundPage />,
      }}
    />
  );
}
