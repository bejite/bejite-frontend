const useLocalStorage = (key) => {
    const stringData = localStorage.getItem(key);
    if (!stringData) return {};

    try {
        const jsonData = JSON.parse(stringData);
        return jsonData && typeof jsonData === "object" ? { ...jsonData } : {};
    } catch (error) {
        console.warn(`Invalid JSON found in localStorage for key: ${key}`, error);
        return {};
    }
};

export default useLocalStorage;
