import { json } from "@remix-run/node";
import { useStoryblokData } from "~/hooks";
import { getStoryblokApi } from "@storyblok/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { implementSeo, getPostCardData, getTotal, getPerPage } from "~/utils";
import type { PostStoryblok } from "~/types";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  let slug = params["*"] ?? "home";
  const sbApi = getStoryblokApi();
  const resolveRelations = ["post.categories", "post.tags", "post.author"];

  const { data } = await sbApi.get(`cdn/stories/authors/${slug}`, {
    version: "draft",
  });

  const story = data?.story;

  const seo = story?.content?.seo_plugin?.title
    ? story?.content?.seo_plugin
    : story?.content?.seo[0];

  let page = Number.isNaN(Number(params.pageNumber))
    ? 1
    : Number(params.pageNumber);

  let perPage = await getPerPage(sbApi);

  const { data: postsByAuthor } = await sbApi.get(`cdn/stories/`, {
    version: "draft",
    starts_with: "blog/",
    is_startpage: false,
    per_page: perPage,
    page,
    resolve_relations: resolveRelations,
    search_term: data.story.uuid,
  });

  const total = await getTotal(data);

  return json({
    blok: story.content,
    name: story.name,
    uuid: story.uuid,
    posts: postsByAuthor?.stories.map((p: PostStoryblok) => getPostCardData(p)),
    perPage,
    total,
    seo,
  });
};

export const meta: MetaFunction = ({ data }: { data: any }) => {
  return implementSeo(data.seo, data.name);
};

const AuthorPage = () => useStoryblokData("routes/authors.$");

export default AuthorPage;
