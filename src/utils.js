export const updateItem = (key: string, value: string) => {
  setItems(prev =>
    prev.map(item =>
      item.key === key
        ? { ...item, value }
        : item
    )
  );
};