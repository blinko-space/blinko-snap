import { FileType } from '@/components/Editor/type';
import { _ } from './lodash';


export interface TagTreeNode {
  name: string;
  children?: TagTreeNode[];
}

export type Tag = {
  id: number;
  name: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
  sortOrder: number;
  parent: number;
}

export type TagTreeDBNode = Tag & { children?: TagTreeDBNode[]; metadata: { icon: string, path: string } }
export const helper = {
  regex: {
    isEndsWithHashTag: /#[/\w\p{L}\p{N}]*$/u,
    //lookbehind assertions in ios regex is not supported
    isContainHashTag: /#[^\s#]*(?:[*?.。]|$)/g
  },
  assemblyPageResult<T>(args: { data: T[], page: number, size: number, result: T[] }): { result: T[], isLoadAll: boolean, isEmpty: boolean } {
    const { data, page, size } = args
    let result = args.result
    let isLoadAll = false
    if (data.length == size) {
      if (page == 1) {
        result = data
      } else {
        result = result.concat(data)
      }
    } else {
      if (page == 1) {
        result = data
      } else {
        result = result.concat(data)
        isLoadAll = true
      }
    }
    return { result, isLoadAll, isEmpty: data.length == 0 }
  },
  extractHashtags(input: string): string[] {
    const hashtagRegex = /#[^\s#]*(?:[*?.。]|$)/g;
    const matches = input.match(hashtagRegex);
    return matches ? matches : [];
  },
  buildHashTagTreeFromHashString(paths: string[]): TagTreeNode[] {
    const root: TagTreeNode[] = [];
    function insertIntoTree(pathArray: string[], nodes: TagTreeNode[]): void {
      if (pathArray.length === 0) return;
      const currentName = pathArray[0];
      let node = nodes.find(n => n.name === currentName);
      if (!node) {
        node = { name: currentName! };
        nodes.push(node);
      }
      if (pathArray.length > 1) {
        if (!node.children) {
          node.children = [];
        }
        insertIntoTree(pathArray.slice(1), node.children);
      }
    }
    for (const path of paths) {
      const pathArray = path.replace(/#/g, '').split('/');
      insertIntoTree(pathArray, root);
    }
    return root;
  },
  buildHashTagTreeFromDb(tags: Tag[]) {
    const map: Record<number, TagTreeDBNode> = {};
    const roots: TagTreeDBNode[] = [];
    tags.forEach(tag => {
      map[tag.id] = { ...tag, children: [], metadata: { icon: tag.icon, path: '' } };
    });
    function buildPath(tagId: number): string {
      const tag = map[tagId];
      if (!tag) return '';
      if (tag.parent && tag.parent !== 0) {
        const parentPath = buildPath(tag.parent);
        return parentPath ? `${parentPath}/${tag.name}` : tag.name;
      }
      return tag.name;
    }
    tags.forEach(tag => {
      const currentNode = map[tag.id];
      currentNode!.metadata.path = buildPath(tag.id);
      if (tag.parent === 0) {
        roots.push(currentNode!);
      } else {
        if (map[tag.parent]) {
          map[tag.parent]?.children?.push(currentNode!);
        }
      }
    });
    roots.sort((a, b) => a.sortOrder - b.sortOrder);
    const sortChildren = (node: TagTreeDBNode) => {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => a.sortOrder - b.sortOrder);
        node.children.forEach(sortChildren);
      }
    };
    roots.forEach(sortChildren);
    return roots;
  },
  generateTagPaths(node: TagTreeDBNode, parentPath: string = ''): string[] {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
    const paths: string[] = [`${currentPath}`];
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        paths.push(...helper.generateTagPaths(child, currentPath));
      }
    }
    return paths;
  },
  getFileExtension(filename: string): string | null {
    const parts = filename.split('.');
    if (parts.length > 1) {
      return parts.pop() || null;
    }
    return null
  },
  getFileType(mimeType: string, filename: string): FileType['previewType'] {
    const extension = helper.getFileExtension(filename) ?? ''

    if (mimeType != '') {
      if (mimeType.startsWith('audio')) return 'audio'
      if (mimeType.startsWith('video')) return 'video'
      if (mimeType.startsWith('image')) return 'image'
    }

    if ('jpeg/jpg/png/bmp/tiff/tif/webp/svg'.includes(extension?.toLowerCase() ?? null)) {
      return 'image'
    }
    if ('mp4/webm/ogg/mov/wmv'.includes(extension?.toLowerCase() ?? null)) {
      return 'video';
    }
    if ('mp3/aac/wav/ogg'.includes(extension?.toLowerCase() ?? null)) {
      return 'audio';
    }
    return 'other'
  },
  json: {
    isJsonString(str: string) {
      if (!str || typeof str !== 'string') return false;
      if (!str?.includes('{')) return false;
      try {
        JSON.parse(str);
      } catch (e) {
        return false;
      }
      return true;
    },
    safeParse(val: any) {
      try {
        return JSON.parse(val);
      } catch (error) {
        return val;
      }
    },
  },
  download: {
    downloadByBlob(name: string, blob: Blob) {
      const a = document.createElement('a');
      const href = window.URL.createObjectURL(blob);
      a.href = href;
      a.download = name;
      a.click();
    },
    downloadByLink(href: string) {
      const a = document.createElement('a');
      a.href = href + '?download=true';
      a.click();
    },
  },
  env: {
    //@ts-ignore
    isBrowser: typeof window === 'undefined' ? false : true,
    isIOS: () => {
      try {
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIPad = /ipad/.test(userAgent);
        const isIPhone = /iphone/.test(userAgent);
        const isIPod = /ipod/.test(userAgent);
        const isMacOS = /macintosh/.test(userAgent) && navigator.maxTouchPoints > 0;
        return isIPad || isIPhone || isIPod || isMacOS;
      } catch (error) {
        return false
      }
    }
  },
};
