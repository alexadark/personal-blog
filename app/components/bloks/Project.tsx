import { storyblokEditable } from "@storyblok/react";
import type { ProjectStoryblok } from "~/types";
export const Project = ({blok}: ProjectStoryblok) => {
    const {headline, image, description, url, _uid} = blok;
  return (
    <div {...storyblokEditable(blok)}>
        <h1>{headline}</h1>
    </div>
  )
}
