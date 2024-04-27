import { storyblokEditable, StoryblokComponent } from "@storyblok/react";
import type { AllProjectsStoryblok, ProjectStoryblok} from "~/types";

export const AllProjects = ({blok}: AllProjectsStoryblok) => {
    const {projects, _uid} = blok;
  return (
    <div {...storyblokEditable(blok)} key={_uid} className="grid sm:grid-cols-2 gap-5">
            {projects.map((project: ProjectStoryblok) => (
                <StoryblokComponent blok={project} key={project._uid} />
            ))}
    </div>
  )
}
