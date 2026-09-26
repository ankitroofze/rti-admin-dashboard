export const layoutSequence = ["layoutOne", "layoutTwo", "layoutThree", "layoutfouth"];

export const newspaperLayouts = {
  layoutOne: [
    { id: "left_big", label: "Front left lead", column: 1, row: 1, blockHeight: 690, blockWidth: 285, estimatedHeightLimit: 420, characterLimit: 6880, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "none", priority: 1 },
    { id: "left_small", label: "Front left box", column: 1, row: 2, blockHeight: 799, blockWidth: 260, estimatedHeightLimit: 330, characterLimit: 6720, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: false, allowDate: false, imagePosition: "none", priority: 2 },
    { id: "center_top", label: "Front main feature", column: 2, row: 1, blockHeight: 790, blockWidth: 770, estimatedHeightLimit: 470, characterLimit: 6050, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "top", priority: 3, isMain: true },
    { id: "center_mid", label: "Front center story", column: 2, row: 2, blockHeight: 620, blockWidth: 460, estimatedHeightLimit: 420, characterLimit: 6900, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 4 },
    { id: "center_bottom", label: "Front bottom box", column: 2, row: 3, blockHeight: 600, blockWidth: 440, estimatedHeightLimit: 300, characterLimit: 6420, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: false, allowDate: false, imagePosition: "none", priority: 5 },
    { id: "right", label: "Front right column", column: 3, row: 1, blockHeight: 1280, blockWidth: 300, estimatedHeightLimit: 680, characterLimit: 6990, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "top", priority: 6, columns: 2 },
  ],
    layoutTwo: [
    { id: "row1_a", label: "Page2 top 1", column: 1, row: 1, blockHeight: 300, blockWidth: 352, estimatedHeightLimit: 300, characterLimit: 900, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 1 },
    { id: "row1_b", label: "Page2 top 2", column: 1, row: 1, blockHeight: 300, blockWidth: 352, estimatedHeightLimit: 300, characterLimit: 900, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 2 },
    { id: "row1_c", label: "Page2 top 3", column: 1, row: 1, blockHeight: 300, blockWidth: 352, estimatedHeightLimit: 300, characterLimit: 900, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 3 },
    { id: "left_big", label: "Page2 left small", column: 1, row: 2, blockHeight: 964, blockWidth: 264, estimatedHeightLimit: 964, characterLimit: 1600, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "none", priority: 4 },
    { id: "center_mid", label: "Page2 middle", column: 2, row: 2, blockHeight: 964, blockWidth: 370, estimatedHeightLimit: 964, characterLimit: 2400, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 5 },
    { id: "right", label: "Page2 right big", column: 3, row: 2, blockHeight: 964, blockWidth: 422, estimatedHeightLimit: 964, characterLimit: 3200, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "top", priority: 6, isMain: true, columns: 2 },
    { id: "center_bottom", label: "Page2 bottom big", column: 1, row: 3, blockHeight: 788, blockWidth: 634, estimatedHeightLimit: 788, characterLimit: 4200, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "top", priority: 7, isMain: true, columns: 3 },
    { id: "bottom_right", label: "Page2 bottom small", column: 3, row: 3, blockHeight: 788, blockWidth: 422, estimatedHeightLimit: 788, characterLimit: 2200, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: false, allowDate: false, imagePosition: "top", priority: 8 },
  ],
  layoutThree: [
    { id: "row1_a", label: "Page3 top 1", column: 1, row: 1, blockHeight: 300, blockWidth: 352, estimatedHeightLimit: 300, characterLimit: 900, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 6 },
    { id: "row1_b", label: "Page3 top 2", column: 1, row: 1, blockHeight: 300, blockWidth: 352, estimatedHeightLimit: 300, characterLimit: 900, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 7 },
    { id: "row1_c", label: "Page3 top 3", column: 1, row: 1, blockHeight: 300, blockWidth: 352, estimatedHeightLimit: 300, characterLimit: 900, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 8 },
    { id: "left_big", label: "Page3 left small", column: 1, row: 2, blockHeight: 964, blockWidth: 264, estimatedHeightLimit: 964, characterLimit: 1600, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "none", priority: 1 },
    { id: "center_mid", label: "Page3 middle", column: 2, row: 2, blockHeight: 964, blockWidth: 370, estimatedHeightLimit: 964, characterLimit: 2400, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 2 },
    { id: "right", label: "Page3 right big", column: 3, row: 2, blockHeight: 964, blockWidth: 422, estimatedHeightLimit: 964, characterLimit: 3200, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "top", priority: 3, isMain: true, columns: 2 },
    { id: "center_bottom", label: "Page3 bottom big", column: 1, row: 3, blockHeight: 788, blockWidth: 634, estimatedHeightLimit: 788, characterLimit: 4200, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "top", priority: 4, isMain: true, columns: 3 },
    { id: "bottom_right", label: "Page3 bottom small", column: 3, row: 3, blockHeight: 788, blockWidth: 422, estimatedHeightLimit: 788, characterLimit: 2200, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: false, allowDate: false, imagePosition: "top", priority: 5 },
  ],
  layoutfouth: [
    { id: "row1_a", label: "Page4 top 1", column: 1, row: 1, blockHeight: 300, blockWidth: 352, estimatedHeightLimit: 300, characterLimit: 900, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 4 },
    { id: "row1_b", label: "Page4 top 2", column: 1, row: 1, blockHeight: 300, blockWidth: 352, estimatedHeightLimit: 300, characterLimit: 900, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 5 },
    { id: "row1_c", label: "Page4 top 3", column: 1, row: 1, blockHeight: 300, blockWidth: 352, estimatedHeightLimit: 300, characterLimit: 900, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 6 },
    { id: "left_big", label: "Page4 left small", column: 1, row: 2, blockHeight: 964, blockWidth: 264, estimatedHeightLimit: 964, characterLimit: 1600, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "none", priority: 1 },
    { id: "center_mid", label: "Page4 middle", column: 2, row: 2, blockHeight: 964, blockWidth: 370, estimatedHeightLimit: 964, characterLimit: 2400, allowImage: false, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: false, imagePosition: "none", priority: 2 },
    { id: "right", label: "Page4 right big", column: 3, row: 2, blockHeight: 964, blockWidth: 422, estimatedHeightLimit: 964, characterLimit: 3200, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "top", priority: 3, isMain: true, columns: 2 },
    { id: "center_bottom", label: "Page4 bottom big", column: 1, row: 3, blockHeight: 788, blockWidth: 634, estimatedHeightLimit: 788, characterLimit: 4200, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: true, allowDate: true, imagePosition: "top", priority: 7, isMain: true, columns: 3 },
    { id: "bottom_right", label: "Page4 bottom small", column: 3, row: 3, blockHeight: 788, blockWidth: 422, estimatedHeightLimit: 788, characterLimit: 2200, allowImage: true, allowTitle: true, allowDescription: true, allowAuthor: false, allowDate: false, imagePosition: "top", priority: 8 },
  ],
};

export const getLayoutBlocks = (layoutName) =>
  [...(newspaperLayouts[layoutName] || [])].sort((a, b) => (
    (a.column - b.column) || (a.row - b.row) || (a.priority - b.priority)
  ));

export const getBlockConfig = (layoutName, blockId) =>
  (newspaperLayouts[layoutName] || []).find((block) => block.id === blockId);

export const getAllBlockLimits = () =>
  layoutSequence.flatMap((layoutName) =>
    getLayoutBlocks(layoutName).map((block) => ({ layoutName, ...block }))
  );
