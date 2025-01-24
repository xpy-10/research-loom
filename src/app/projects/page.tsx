import CreateProject from "../_components/createProject";
import ProjectList from "../_components/projectList";

export default function Projects() {
    return (
        <>
        <div className="flex flex-column justify-center">
            <CreateProject/>
        </div>
        <div className="flex pt-10 pl-10">
            <ProjectList />
        </div>
        </>
    )
}