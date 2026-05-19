# High-Throughput Bio-Data Analysis & Integration · Interactive Tutorial

**🌐 Live demo / 線上瀏覽**: <https://charlene717.github.io/htba-interactive-tutorial/>


> 20 章雙語互動式教程，從定序原理到多體學整合、基礎模型、可重現性。  
> 20-chapter bilingual interactive tutorial — from sequencing principles to multi-omics integration, foundation models, and reproducibility.

## 章節 / Chapters

**Block 1 · 基礎 / Foundations**
- Ch 1 高通量數據總覽 / Overview
- Ch 2 實驗設計與功率分析 / Experimental design & power
- Ch 3 FASTQ → counts 上游流程 / Upstream pipeline

**Block 2 · 基因組 / Genomics & Epigenomics**
- Ch 4 變異偵測與註釋 / Variant calling
- Ch 5 結構變異與長讀定序 / SV & long-read
- Ch 6 ATAC-seq 與 CUT&RUN / ATAC & CUT&RUN
- Ch 7 DNA 甲基化 / DNA methylation

**Block 3 · 轉錄組 / Transcriptomics**
- Ch 8 Bulk RNA-seq 差異分析
- Ch 9 scRNA-seq 核心流程 (recap)
- Ch 10 空間轉錄組 / Spatial
- Ch 11 長讀全長轉錄組 / Long-read RNA

**Block 4 · 蛋白質與代謝 / Proteomics & Metabolomics**
- Ch 12 蛋白質體 / Proteomics
- Ch 13 代謝體 / Metabolomics

**Block 5 · 整合 / Integration**
- Ch 14 批次效應與水平整合 / Batch correction
- Ch 15 多體學垂直整合 / Multi-omics integration
- Ch 16 空間 × 單細胞整合 / Spatial × single-cell
- Ch 17 功能富集與通路 / Enrichment & pathways
- Ch 18 網絡分析與圖學習 / Network analysis & GNN

**Block 6 · 基礎模型與部署 / Foundation models & deployment**
- Ch 19 生物基礎模型 / Bio foundation models (scGPT / AlphaFold 3)
- Ch 20 可重現性、雲端與倫理 / Reproducibility, cloud, ethics

## 互動評量 / Quiz
20 章 × ~10 題 = ~200 題雙語題庫；含使用者 profile、隨機 20、錯題複習、模擬考。  
位於同層的 `htba-quiz/index.html`。

## 設計與技術 / Stack
- 純 HTML + CSS + vanilla JS（無 build step）
- Chart.js (CDN) 用於少數互動圖表
- 雙語 i18n：`data-lang="zh|en"` + `data-zh / data-en`
- 配色：青藍 #0e7490 + 暖橙 #f97316

## 啟動 / Launch
直接以瀏覽器開啟 `index.html` 即可，無需 server。

## 姊妹教程 / Companion
- `../../scRNA-seq/scrna-interactive-tutorial-main/` — 單細胞 12 章深入版
- `../../Data_Science_Foundations/ds-foundations-interactive-tutorial-main/` — 資料科學前置課程

© Charlene
