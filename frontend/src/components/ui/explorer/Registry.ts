import { ExplorerRenderer } from './types';

class RendererRegistry {
    private renderers = new Map<string, ExplorerRenderer>();

    register(name: string, renderer: ExplorerRenderer) {
        this.renderers.set(name, renderer);
    }

    get(name: string): ExplorerRenderer {
        const renderer = this.renderers.get(name);
        if (!renderer) {
            throw new Error(`Renderer '${name}' not found in ExplorerRendererRegistry`);
        }
        return renderer;
    }
}

export const ExplorerRendererRegistry = new RendererRegistry();

import { TableRenderer } from './TableRenderer';
import { GridRenderer } from './GridRenderer';

ExplorerRendererRegistry.register("table", new TableRenderer());
ExplorerRendererRegistry.register("grid", new GridRenderer());
