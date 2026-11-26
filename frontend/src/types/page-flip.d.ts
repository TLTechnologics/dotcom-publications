declare module 'page-flip' {
  export interface PageFlipSettings {
    width?: number;
    height?: number;
    size?: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    startPage?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings?: PageFlipSettings);
    loadFromHTML(elements: NodeListOf<HTMLElement> | HTMLElement[]): void;
    destroy(): void;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    turnToPage(pageIndex: number): void;
    turnToNextPage(): void;
    turnToPrevPage(): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    on(event: string, callback: (e: any) => void): void;
    off(event: string, callback: (e: any) => void): void;
    update(): void;
  }
}
