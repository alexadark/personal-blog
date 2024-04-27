import { storyblokEditable, StoryblokComponent } from "@storyblok/react";
import type { AllProjectsStoryblok, ProjectStoryblok} from "~/types";

export const AllProjects = ({blok}: AllProjectsStoryblok) => {
    const {projects, _uid} = blok;
  return (
    <div {...storyblokEditable(blok)}>
        <h1>All Projects</h1>
        <div>
            {projects.map((project: ProjectStoryblok) => (
                <StoryblokComponent blok={project} key={project._uid} />
            ))}
        </div>
    </div>
  )
}
