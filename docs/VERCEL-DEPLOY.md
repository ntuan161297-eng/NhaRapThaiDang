# Build Vercel: native binding đa nền tảng

Lỗi tại commit `bec69eb`: root lockfile tạo từ `node_modules` đang có trên Windows chỉ ghi native binding Windows. Trên Vercel Linux, npm không cài `@rolldown/binding-linux-x64-gnu`; cache cũ cũng được khôi phục. Tương tự, lock thiếu các gói Linux của Tailwind Oxide, Lightning CSS và TypeScript.

Bản sửa dùng một `package-lock.json` ở gốc npm workspaces, đầy đủ metadata nền tảng. Bỏ lockfile độc lập cũ trong `apps/web`; Vercel cài sạch bằng `npm ci --include=dev --include=optional`, được cấu hình trong `vercel.json`. Không cài binding Linux thành dependency bắt buộc vì vẫn cần phát triển trên Windows.

Thiết lập ba dự án Vercel đang trỏ tới repository này:

- Root Directory: gốc repository (để trống hoặc `.`).
- Install Command: theo `vercel.json`, `npm ci --include=dev --include=optional`.
- Build Command: `npm run build`.
- Output Directory: `public`.
- Node.js: 24.x, tương ứng log Vercel. Workflow Linux cũng kiểm tra bằng Node 24.

Commit mới vào `main` sẽ kích hoạt Vercel khi tích hợp Git đang bật. Nếu bấm Redeploy thủ công, chọn commit sửa mới nhất. Không cần xóa `node_modules` đang dùng trên máy để tạo lại deployment; `npm ci` làm sạch cây dependency trong môi trường build.

Kiểm tra ở gốc:

```text
npm run check:lockfile
npm ci --include=dev --include=optional
npm run build
npm run typecheck
```

Chỉ dùng một lockfile gốc. Khi cần tạo lại lock, chạy npm trong bản checkout/thư mục sạch không có `node_modules`; kiểm tra `npm run check:lockfile` trước khi commit. Nếu chỉ thêm một dependency, chạy npm từ gốc với `--workspace=web`, rồi kiểm tra lockfile. Workflow `.github/workflows/build.yml` kiểm tra cài sạch và production build trên Ubuntu để phát hiện thiếu native binding trước lần triển khai tiếp theo.

Tham khảo: [npm ci](https://docs.npmjs.com/cli/v11/commands/npm-ci/), [cấu hình Vercel](https://vercel.com/docs/project-configuration).
