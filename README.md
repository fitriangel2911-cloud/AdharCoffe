# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

##alur logika sistem

```mermaid graph TD
    %% Node Definitions
    Start([Start: Kasir memilih produk di UI])
    Action1[Action: Aplikasi menerima ID Produk]
    CheckStok{Check: Stok tersedia<br/>di Supabase?}
    OutHabis[/Output: Munculkan pesan<br/>stok habis di UI/]
    Subtotal[Lanjutkan Perhitungan Subtotal]
    
    subgraph AIAudit [AI Audit Process]
        Validation{Validation: AI Agent<br/>Audit Akad Syariah}
        CekAkad[Validasi Batasan<br/>Produk Konsinyasi]
        CekMargin[Validasi Kejujuran<br/>Harga/Margin]
    end

    OutTotal[/Output: Kirim Total Harga ke UI/]
    SaveDB[(Simpan Transaksi ke<br/>tabel 'sales' di Supabase)]
    Selesai([Selesai])

    %% Connections
    Start --> Action1
    Action1 --> CheckStok
    
    CheckStok -- Tidak --> OutHabis
    CheckStok -- Ya --> Subtotal
    
    Subtotal --> Validation
    
    Validation -- Cek Akad --> CekAkad
    Validation -- Cek Margin --> CekMargin
    
    CekAkad --> OutTotal
    CekMargin --> OutTotal
    
    OutTotal --> SaveDB
    SaveDB --> Selesai

    %% Styling
    style Start fill:#e1f5fe,stroke:#01579b
    style CheckStok fill:#fff,stroke:#333
    style OutHabis fill:#ffebee,stroke:#ef5350
    style Validation fill:#fce4ec,stroke:#d81b60
    style AIAudit fill:#fafafa,stroke:#333,stroke-dasharray: 5 5
    style SaveDB fill:#e8f5e9,stroke:#4caf50
    style Selesai fill:#fff,stroke:#333
    style CekAkad stroke-dasharray: 5 5
    style CekMargin stroke-dasharray: 5 5```
