import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useTemplateStore = create(
  devtools(
    persist(
      (set, get) => ({
        templates: [],
        selectedTemplate: 'layoutOne',
        newspaperData: null,
        
        setTemplates: (templates) => set({ templates }),
        setSelectedTemplate: (template) => set({ selectedTemplate: template }),
        setNewspaperData: (data) => set({ newspaperData: data }),
        
        updateNewspaperData: (updates) => set((state) => ({
          newspaperData: { ...state.newspaperData, ...updates }
        })),
      }),
      {
        name: 'newspaper-storage',
      }
    )
  )
);

const usePdfStore = create(
  devtools(
    persist(
      (set, get) => ({
        pdfData: null,
        isGenerating: false,
        error: null,
        
        setPdfData: (data) => set({ pdfData: data }),
        setIsGenerating: (isGenerating) => set({ isGenerating }),
        setError: (error) => set({ error }),
        
        resetPdf: () => set({ pdfData: null, error: null }),
      }),
      {
        name: 'pdf-storage',
      }
    )
  )
);

export { useTemplateStore, usePdfStore };