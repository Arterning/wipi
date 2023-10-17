import { httpProvider } from './http';
import projectsData from '../mock/projects';

export class ProjectProvider {

    static isMock = true;

    static async getProjects(): Promise<[IProject[], number]> {
        if (ProjectProvider.isMock) {
            const data: [IProject[], number] = [projectsData, projectsData.length];
            return Promise.resolve(data);
        }
        return httpProvider.get('/project');
    }

    static async create(data): Promise<IProject> {
        if (ProjectProvider.isMock) {
            projectsData.push(data);
            return Promise.resolve(data);
        }
        return httpProvider.post('/project', data);
    }

    static async update(id, data): Promise<IProject> {
        if (ProjectProvider.isMock) {
            projectsData[id] = data;
            return Promise.resolve(data);
        }
        return httpProvider.patch(`/project/${id}`, data);
    }

}
