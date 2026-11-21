document.addEventListener("DOMContentLoaded", () => {
  // Lazy load image reveal effect
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach((img) => {
    if (img.complete) {
      img.classList.add("is-loaded");
    } else {
      img.addEventListener("load", () => {
        img.classList.add("is-loaded");
      });
    }
  });

  // ==========================================================================
  // PROFESSIONAL DYNAMIC INTERACTION EFFECTS
  // ==========================================================================

  // 1. Scroll Progress Bar (rAF throttled & scaleX composited)
  const scrollProgressContainer = document.createElement("div");
  scrollProgressContainer.className = "scroll-progress-container";
  const scrollProgressBar = document.createElement("div");
  scrollProgressBar.className = "scroll-progress-bar";
  scrollProgressContainer.appendChild(scrollProgressBar);
  document.body.appendChild(scrollProgressContainer);

  let progressTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!progressTicking) {
        window.requestAnimationFrame(() => {
          const totalScroll = window.scrollY || document.documentElement.scrollTop;
          const windowHeight =
            document.documentElement.scrollHeight - window.innerHeight;
          const progress = windowHeight > 0 ? Math.min(1, Math.max(0, totalScroll / windowHeight)) : 0;
          scrollProgressBar.style.transform = `scaleX(${progress})`;
          progressTicking = false;
        });
        progressTicking = true;
      }
    },
    { passive: true },
  );

  // 3. Magnetic Button Effect (only on devices with a mouse)
  if (window.matchMedia("(pointer: fine)").matches) {
    const magneticButtons = document.querySelectorAll(".magnetic-btn, .btn");
    magneticButtons.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const pullX = x * 0.3;
        const pullY = y * 0.3;
        btn.style.transform = `translate(${pullX}px, ${pullY}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transform = `translate(0px, 0px)`;
        btn.style.transition = `transform 0.5s ease`;
      });

      btn.addEventListener("mouseenter", () => {
        btn.style.transition = `none`;
      });
    });
  }
});
const tabs = document.querySelectorAll(".tab");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("nav");
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.error("SW setup failed", err));
  });

  // Xóa cache Service Worker để tải lại dữ liệu mới nhất khi người dùng chủ động refresh trang (F5)
  const navEntry = performance.getEntriesByType("navigation")[0];
  if (navEntry && navEntry.type === "reload" && "caches" in window) {
    caches.keys().then((names) => {
      names.forEach((name) => caches.delete(name));
    });
  }
}

if (menuButton) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", isOpen);
  });
}

if (navigation) {
  navigation
    .querySelectorAll("a")
    .forEach((link) =>
      link.addEventListener("click", () => navigation.classList.remove("open")),
    );
}

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const hasFinePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;

if (!prefersReducedMotion) {
  const tiltCards = document.querySelectorAll(".tilt-3d");

  if (hasFinePointer) {
    tiltCards.forEach((card) => {
      const strength = card.classList.contains("tilt-hero") ? 4 : 7;
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        card.style.setProperty("--tilt-x", `${-y * strength}deg`);
        card.style.setProperty("--tilt-y", `${x * strength}deg`);
        card.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
        card.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
        card.classList.add("is-tilting");
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
        card.classList.remove("is-tilting");
      });
    });
  } else if (window.DeviceOrientationEvent) {
    let initialBeta = null;
    let initialGamma = null;

    window.addEventListener(
      "deviceorientation",
      (event) => {
        // Bỏ qua nếu không có dữ liệu (ví dụ: trình duyệt không cho phép)
        if (event.beta === null || event.gamma === null) return;

        if (initialBeta === null) {
          initialBeta = event.beta;
          initialGamma = event.gamma;
        }

        let beta = event.beta - initialBeta;
        let gamma = event.gamma - initialGamma;

        // Giới hạn góc nghiêng để tránh hiệu ứng quá giật
        beta = Math.max(-20, Math.min(20, beta));
        gamma = Math.max(-20, Math.min(20, gamma));

        tiltCards.forEach((card) => {
          // Chỉ apply cho các card đang hiển thị trên viewport để tối ưu hiệu suất
          const rect = card.getBoundingClientRect();
          if (
            rect.top >= 0 &&
            rect.bottom <=
              (window.innerHeight || document.documentElement.clientHeight)
          ) {
            const strength = card.classList.contains("tilt-hero") ? 4 : 7;
            const x = (gamma / 20) * 0.5;
            const y = (beta / 20) * 0.5;

            card.style.setProperty("--tilt-x", `${-y * strength}deg`);
            card.style.setProperty("--tilt-y", `${x * strength}deg`);
            card.style.setProperty("--glow-x", `${(x + 0.5) * 100}%`);
            card.style.setProperty("--glow-y", `${(y + 0.5) * 100}%`);
            card.classList.add("is-tilting");
          } else {
            // Reset nếu nằm ngoài viewport
            card.style.setProperty("--tilt-x", "0deg");
            card.style.setProperty("--tilt-y", "0deg");
            card.classList.remove("is-tilting");
          }
        });
      },
      true,
    );
  }
}

if (tabs) {
  tabs.forEach((tab) =>
    tab.addEventListener("click", () => {
      tabs.forEach((item) => {
        item.classList.remove("active");
        item.setAttribute("aria-selected", "false");
        item.setAttribute("tabindex", "-1");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      tab.setAttribute("tabindex", "0");
      const area = tab.dataset.area;
      document
        .querySelectorAll("[data-rural]")
        .forEach((price) => (price.textContent = price.dataset[area]));

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "tab_switch",
        area_type: area,
      });
    }),
  );
}

document.querySelectorAll('a[href="#contact"]').forEach((link) =>
  link.addEventListener("click", () => {
    const packageName = link
      .closest(".package")
      ?.querySelector("h3")
      ?.textContent.trim();
    if (packageName) {
      const finalPackage = packageName.includes("GIGA")
        ? "GIGA / SKY"
        : packageName;
      document.querySelector('[name="package"]').value = finalPackage;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "package_select",
        package_name: finalPackage,
      });
    }
  }),
);

async function getUserLocation() {
  const getIpLocation = async (reason) => {
    try {
      const res = await fetch("https://get.geojs.io/v1/ip/geo.json");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        return `IP: ${data.city}, ${data.region} | https://www.google.com/maps?q=${data.latitude},${data.longitude} (${reason})`;
      }
      return "Không lấy được vị trí (" + reason + ")";
    } catch (e) {
      return "Không lấy được vị trí (" + reason + ")";
    }
  };

  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(getIpLocation("Trình duyệt không hỗ trợ GPS"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(
          `GPS: https://www.google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,
        );
      },
      (error) => {
        let reason = "Lỗi GPS chưa rõ";
        if (error.code === 1) reason = "Khách chặn quyền GPS";
        if (error.code === 2) reason = "Không định vị được GPS";
        if (error.code === 3) reason = "GPS phản hồi quá lâu";
        resolve(getIpLocation(reason));
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 },
    );
  });
}

// Google Apps Script Web App Endpoint URL (Send lead to Google Sheet & notify Email)
const WORKER_LEAD_ENDPOINT = "https://man-chatbot.tvm19624.workers.dev/api/lead";
const GOOGLE_SHEETS_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbwvkgJ0GpdzEwh6Us5AFJ8uUlwuO3paCxqhSY8JhAzWur3Ws6KIuLxlrPN4-lqtBDeO/exec";

// Global form submission handler with event delegation (handles both #leadForm and #popupForm)
document.addEventListener("submit", async (event) => {
  const form = event.target.closest("#leadForm, #popupForm");
  if (!form) return;
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const result = form.querySelector(".success");
  const originalLabel = submitButton ? submitButton.innerHTML : "Gửi";

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Đang gửi...";
  }
  if (result) {
    result.textContent = "";
    result.classList.remove("error");
  }

  const formData = new FormData(form);
  const isSupportMode = formData.get("form_type") === "support" || !!formData.get("Nội dung hỗ trợ");
  const name = formData.get("Họ tên") || "";
  const phone = isSupportMode
    ? (formData.get("Thông tin khách hàng") || formData.get("Số điện thoại") || "")
    : (formData.get("Số điện thoại") || "");
  const pkg = isSupportMode ? "Yêu cầu hỗ trợ CSKH / Kỹ thuật" : (formData.get("Gói cước") || "Tư vấn chung");
  const note = isSupportMode ? (formData.get("Nội dung hỗ trợ") || "") : (formData.get("Ghi chú") || "");

  if (isSupportMode) {
    formData.set("Số điện thoại", phone);
    formData.set("Gói cước", pkg);
    formData.set("Ghi chú", note);
  }

  // Turnstile Bot Protection Token Extraction
  let tsToken = formData.get("cf-turnstile-response");
  if (!tsToken && typeof window.turnstile !== "undefined" && typeof window.turnstile.getResponse === "function") {
    try {
      tsToken = window.turnstile.getResponse();
    } catch (e) {}
  }
  if (tsToken) {
    formData.set("cf-turnstile-response", tsToken);
  }

  // Honeypot check — silently reject bots
  const honeypot = form.querySelector('[name="website"]');
  if (honeypot && honeypot.value) {
    if (result)
      result.textContent =
        "Cảm ơn bạn! FPT sẽ liên hệ hỗ trợ trong thời gian sớm nhất.";
    if (typeof window.closeRegisterModal === "function")
      window.closeRegisterModal();
    if (typeof window.openSuccessModal === "function")
      window.openSuccessModal(name, phone, pkg);
    form.reset();
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalLabel;
    }
    return;
  }

  try {
    const locationInfo =
      typeof getUserLocation === "function"
        ? await getUserLocation()
        : "Chưa xác định";
    formData.append("Tọa độ", locationInfo);

    // Primary Submission to Cloudflare Worker (D1 + Fail-Fast Turnstile + Background Notifications)
    const workerPromise = fetch(WORKER_LEAD_ENDPOINT, {
      method: "POST",
      body: formData,
    }).catch((e) => console.warn("Worker lead submit notice:", e));

    // Wait for the ultra-fast worker response (< 100ms)
    const response = await workerPromise;
    if (response && response.ok) {
      const respData = await response.json();
      console.log("Lead successfully stored in Cloudflare D1:", respData);
    } else {
      // Fallback directly to Google Sheets if worker was unreachable
      await fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: "POST",
        body: formData,
      });
    }

    if (result)
      result.textContent =
        "Cảm ơn bạn! FPT sẽ liên hệ tư vấn trong thời gian sớm nhất.";

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "form_submit",
      package_name: pkg,
      time_preference: formData.get("Thời gian liên hệ") || "Gọi ngay",
    });

    // Close Registration Modal if open
    if (typeof window.closeRegisterModal === "function")
      window.closeRegisterModal();

    // Show Success Modal
    if (typeof window.openSuccessModal === "function")
      window.openSuccessModal(name, phone, pkg);

    form.reset();
  } catch (error) {
    console.error("Form submit error:", error);
    if (result) {
      result.textContent =
        "Cảm ơn bạn! FPT sẽ liên hệ tư vấn trong thời gian sớm nhất.";
    }
    if (typeof window.closeRegisterModal === "function")
      window.closeRegisterModal();
    if (typeof window.openSuccessModal === "function")
      window.openSuccessModal(name, phone, pkg);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalLabel;
    }
  }
});
// Track Phone clicks
document.querySelectorAll('a[href^="tel:"]').forEach((link) => {
  link.addEventListener("click", () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "phone_click",
      phone_number: link.getAttribute("href").replace("tel:", ""),
    });
  });
});

// Track Zalo clicks
document.querySelectorAll('a[href^="https://zalo.me"]').forEach((link) => {
  link.addEventListener("click", () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "zalo_click",
      zalo_number: link.getAttribute("href").replace("https://zalo.me/", ""),
    });
  });
});

/* =========================================================
     BẢN ĐỒ VIỆT NAM 3D – EXTRUDE + BLOOM + DATA PARTICLES
     ========================================================= */
function initMap3D() {
  const container = document.getElementById("map3d-container");
  if (!container) return;
  const canvas = document.getElementById("map3d-canvas");
  const rotateBtn = document.getElementById("map-rotate");
  const resetBtn = document.getElementById("map-reset");
  const zoomInBtn = document.getElementById("map-zoom-in");
  const zoomOutBtn = document.getElementById("map-zoom-out");
  const cW = container.clientWidth,
    cH = container.clientHeight;

  // Inject importmap dynamically (moved from <head> for performance)
  if (!document.querySelector('script[type="importmap"]')) {
    const im = document.createElement("script");
    im.type = "importmap";
    im.textContent = JSON.stringify({
      imports: {
        three: "https://unpkg.com/three@0.160.0/build/three.module.js",
        "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/",
      },
    });
    document.head.appendChild(im);
  }

  // Import THREE dynamically
  Promise.all([
    import("three"),
    import("three/addons/controls/OrbitControls.js"),
    import("three/addons/postprocessing/EffectComposer.js"),
    import("three/addons/postprocessing/RenderPass.js"),
    import("three/addons/postprocessing/UnrealBloomPass.js"),
  ])
    .then(
      ([
        THREE,
        { OrbitControls },
        { EffectComposer },
        { RenderPass },
        { UnrealBloomPass },
      ]) => {
        // S = 0.95 (tăng kích thước bản đồ lên ~60% để nhìn rõ toàn cảnh)
        const S = 0.95,
          H = 7,
          TOP = H;
        const P = (x, y, yTop = TOP) =>
          new THREE.Vector3((x - 50) * S, yTop, -(y - 50) * S);

        /* ── Trạm phát sóng (tọa độ thực tế lat/lon → lưới) ── */
        const STATIONS = [
          { n: "Hà Nội", x: 39, y: 74 }, // 105.85°E, 21.03°N
          { n: "Hải Phòng", x: 47, y: 73 }, // 106.68°E, 20.86°N
          { n: "Vinh", x: 38, y: 61 }, // 105.68°E, 18.68°N
          { n: "Huế", x: 55, y: 49 }, // 107.59°E, 16.46°N
          { n: "Đà Nẵng", x: 60, y: 47 }, // 108.22°E, 16.05°N
          { n: "Nha Trang", x: 69, y: 26 }, // 109.19°E, 12.24°N
          { n: "Đà Lạt", x: 62, y: 24 }, // 108.44°E, 11.94°N
          { n: "TP. HCM", x: 46, y: 18 }, // 106.63°E, 10.82°N
          { n: "Cần Thơ", x: 38, y: 14 }, // 105.75°E, 10.05°N
          { n: "Hoàng Sa", x: 95, y: 50, sea: true }, // ~112°E, 16.5°N
          { n: "Trường Sa", x: 113, y: 14, sea: true }, // ~114°E, 10°N
        ];

        /* ── SCENE / CAMERA / RENDERER ── */
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x02060d);
        scene.fog = new THREE.FogExp2(0x02060d, 0.005);

        // Camera đặt góc gần và góc nghiêng tối ưu để bản đồ chiếm trọn khung hình
        const camera = new THREE.PerspectiveCamera(45, cW / cH, 0.1, 2000);
        camera.position.set(0, 42, 54 + Math.max(0, (1.5 - cW / cH) * 28));

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setSize(cW, cH);
        renderer.toneMapping = THREE.ACESFilmicToneMapping;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.6;
        controls.maxPolarAngle = Math.PI / 2.1;
        controls.minDistance = 15;
        controls.maxDistance = 180;

        // Ánh sáng
        scene.add(new THREE.AmbientLight(0x223344, 1.4));
        const dir = new THREE.DirectionalLight(0x88ccff, 1.2);
        dir.position.set(30, 60, 20);
        scene.add(dir);

        // Lưới nền công nghệ
        const grid = new THREE.GridHelper(300, 50, 0x0a4a55, 0x06222b);
        grid.position.y = -0.1;
        scene.add(grid);

        /* ── KHỐI Bản đồ (Được fetch động từ Highcharts GeoJSON) ── */
        const mapGroup = new THREE.Group();
        mapGroup.rotation.x = -Math.PI / 2;
        scene.add(mapGroup);

        // Hiệu ứng phát sáng khối
        const mat = new THREE.MeshPhongMaterial({
          color: 0xb00010,
          emissive: 0x550008,
          shininess: 40,
          transparent: true,
          opacity: 0.95,
        });
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x00fff0,
          transparent: true,
          opacity: 0.35,
        });

        fetch(
          "https://code.highcharts.com/mapdata/countries/vn/vn-all.geo.json",
        )
          .then((r) => r.json())
          .then((geojson) => {
            let hnCenter = { x: 0, y: 0, c: 0 },
              hcCenter = { x: 0, y: 0, c: 0 };
            geojson.features.forEach((f) => {
              const polys =
                f.geometry.type === "Polygon"
                  ? [f.geometry.coordinates]
                  : f.geometry.coordinates;
              polys.forEach((poly) => {
                poly[0].forEach((pt) => {
                  if (
                    f.properties["hc-key"] === "vn-318" ||
                    f.properties["hc-key"] === "vn-hn"
                  ) {
                    hnCenter.x += pt[0];
                    hnCenter.y += pt[1];
                    hnCenter.c++;
                  }
                  if (f.properties["hc-key"] === "vn-hc") {
                    hcCenter.x += pt[0];
                    hcCenter.y += pt[1];
                    hcCenter.c++;
                  }
                });
              });
            });
            hnCenter.x /= hnCenter.c;
            hnCenter.y /= hnCenter.c;
            hcCenter.x /= hcCenter.c;
            hcCenter.y /= hcCenter.c;

            const targetHN = { x: 39, y: 74 },
              targetHC = { x: 46, y: 18 };
            const scaleX =
              (targetHC.x - targetHN.x) / (hcCenter.x - hnCenter.x);
            const offsetX = targetHN.x - hnCenter.x * scaleX;
            const scaleY =
              (targetHC.y - targetHN.y) / (hcCenter.y - hnCenter.y);
            const offsetY = targetHN.y - hnCenter.y * scaleY;

            const mapX = (hx) => hx * scaleX + offsetX;
            const mapY = (hy) => hy * scaleY + offsetY;

            const shapes = [];
            geojson.features.forEach((f) => {
              const polys =
                f.geometry.type === "Polygon"
                  ? [f.geometry.coordinates]
                  : f.geometry.coordinates;
              polys.forEach((poly) => {
                const shape = new THREE.Shape();
                const ring = poly[0];
                for (let i = 0; i < ring.length; i++) {
                  if (i > 0 && i < ring.length - 1 && i % 3 !== 0) continue;
                  const X = (mapX(ring[i][0]) - 50) * S;
                  const Y = (mapY(ring[i][1]) - 50) * S;
                  if (!isNaN(X) && !isNaN(Y)) {
                    if (i === 0) shape.moveTo(X, Y);
                    else shape.lineTo(X, Y);
                  }
                }
                shape.closePath();
                shapes.push(shape);
              });
            });

            const extrudeGeo = new THREE.ExtrudeGeometry(shapes, {
              depth: H,
              bevelEnabled: true,
              bevelThickness: 0.2,
              bevelSize: 0.2,
              bevelSegments: 1,
              curveSegments: 1,
            });

            mapGroup.add(new THREE.Mesh(extrudeGeo, mat));
            mapGroup.add(
              new THREE.LineSegments(
                new THREE.EdgesGeometry(extrudeGeo, 2),
                lineMat,
              ),
            );
          })
          .catch((e) => console.error("Lỗi tải bản đồ:", e));

        /* ── NGÔI SAO VÀNG (khu vực Hà Nội) ── */
        const starS = new THREE.Shape();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? 2.5 : 6,
            a = Math.PI / 2 + (i * Math.PI) / 5;
          i
            ? starS.lineTo(Math.cos(a) * r, Math.sin(a) * r)
            : starS.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        starS.closePath();
        const star = new THREE.Mesh(
          new THREE.ShapeGeometry(starS),
          new THREE.MeshBasicMaterial({ color: 0xffd400 }),
        );
        star.rotation.x = -Math.PI / 2;
        star.position.copy(P(38, 46, H + 0.3));
        scene.add(star);

        /* ── TRẠM PHÁT SÓNG + VÒNG SÓNG LAN TỎA (PULSE) ── */
        const pulses = [];
        const ringGeo = new THREE.RingGeometry(1.0, 1.2, 48);

        function makeLabel(text, sea) {
          const c = document.createElement("canvas");
          c.width = 256;
          c.height = 64;
          const ctx = c.getContext("2d");
          ctx.font = "bold 26px Inter, system-ui, sans-serif";
          ctx.fillStyle = sea ? "#ff6b6b" : "#eafff9";
          ctx.shadowColor = sea ? "#ff0000" : "#00ffd0";
          ctx.shadowBlur = 10;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(text, 128, 32);
          const tex = new THREE.CanvasTexture(c);
          const sp = new THREE.Sprite(
            new THREE.SpriteMaterial({ map: tex, transparent: true }),
          );
          sp.scale.set(16, 4, 1);
          return sp;
        }

        STATIONS.forEach((st) => {
          const base = P(st.x, st.y, st.sea ? 0.2 : H + 0.2);

          // Chấm sáng trung tâm trạm
          const dot = new THREE.Mesh(
            new THREE.SphereGeometry(1.1, 16, 16),
            new THREE.MeshBasicMaterial({
              color: st.sea ? 0xff5555 : 0x9bffff,
            }),
          );
          dot.position.copy(base);
          scene.add(dot);

          // Nhãn tên
          const label = makeLabel(st.n, st.sea);
          label.position.copy(base).add(new THREE.Vector3(0, 4.5, 0));
          scene.add(label);

          // 3 vòng sóng lệch pha
          for (let k = 0; k < 3; k++) {
            const m = new THREE.Mesh(
              ringGeo,
              new THREE.MeshBasicMaterial({
                color: st.sea ? 0xff4444 : 0x00ffd0,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
              }),
            );
            m.rotation.x = -Math.PI / 2;
            m.position.copy(base);
            scene.add(m);
            pulses.push({
              mesh: m,
              phase: k / 3,
              speed: 0.35,
              max: st.sea ? 26 : 20,
            });
          }
        });

        /* ── MẠNG LƯỚI KẾT NỐI (MESH NETWORK) ── */
        const dashMat = new THREE.LineDashedMaterial({
          color: 0x33e0ff,
          dashSize: 1.4,
          gapSize: 0.9,
          transparent: true,
          opacity: 0.6,
          blending: THREE.AdditiveBlending,
        });
        [
          [0, 1],
          [0, 2],
          [2, 3],
          [3, 4],
          [4, 5],
          [5, 6],
          [6, 7],
          [7, 8],
          [4, 9],
          [7, 10],
          [0, 4],
        ].forEach(([a, b]) => {
          const pa = P(
            STATIONS[a].x,
            STATIONS[a].y,
            STATIONS[a].sea ? 0.2 : H + 0.2,
          );
          const pb = P(
            STATIONS[b].x,
            STATIONS[b].y,
            STATIONS[b].sea ? 0.2 : H + 0.2,
          );
          const mid = pa.clone().add(pb).multiplyScalar(0.5);
          mid.y += 10;
          const geo = new THREE.BufferGeometry().setFromPoints(
            new THREE.QuadraticBezierCurve3(pa, mid, pb).getPoints(40),
          );
          const line = new THREE.Line(geo, dashMat);
          line.computeLineDistances();
          scene.add(line);
        });

        /* ── HẠT DỮ LIỆU BAY (DATA PARTICLES) ── */
        const N = 2000;
        const posArr = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          posArr[i * 3] = (Math.random() - 0.5) * 450;
          posArr[i * 3 + 1] = H + Math.random() * 120;
          posArr[i * 3 + 2] = (Math.random() - 0.5) * 450;
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
        scene.add(
          new THREE.Points(
            pGeo,
            new THREE.PointsMaterial({
              color: 0x66ffee,
              size: 0.6,
              transparent: true,
              opacity: 0.8,
              blending: THREE.AdditiveBlending,
              depthWrite: false,
            }),
          ),
        );

        /* ── POST-PROCESSING: BLOOM (hiệu ứng phát sáng) ── */
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(
          new UnrealBloomPass(new THREE.Vector2(cW, cH), 1.25, 0.5, 0.0),
        );

        /* ── ĐIỀU KHIỂN & PHÓNG TO / THU NHỎ ── */
        if (rotateBtn) {
          rotateBtn.textContent = "⟳ Dừng quay";
          rotateBtn.addEventListener("click", () => {
            controls.autoRotate = !controls.autoRotate;
            rotateBtn.textContent = controls.autoRotate
              ? "⟳ Dừng quay"
              : "⟳ Tự quay";
          });
        }
        if (zoomInBtn) {
          zoomInBtn.addEventListener("click", () => {
            camera.position.multiplyScalar(0.85);
            controls.update();
          });
        }
        if (zoomOutBtn) {
          zoomOutBtn.addEventListener("click", () => {
            camera.position.multiplyScalar(1.18);
            controls.update();
          });
        }
        if (resetBtn) {
          resetBtn.addEventListener("click", () => {
            camera.position.set(
              0,
              42,
              54 + Math.max(0, (1.5 - camera.aspect) * 28),
            );
            controls.target.set(0, 0, 0);
            controls.update();
          });
        }

        /* ── VÒNG LẶP ANIMATION ── */
        const clock = new THREE.Clock();
        let isVisible = true;
        if ("IntersectionObserver" in window) {
          const observer = new IntersectionObserver((entries) => {
            isVisible = entries[0].isIntersecting;
          });
          observer.observe(canvas);
        }

        (function animate() {
          requestAnimationFrame(animate);
          if (!isVisible) return;
          const dt = clock.getDelta();

          pulses.forEach((p) => {
            p.phase += dt * p.speed;
            if (p.phase > 1) p.phase -= 1;
            const s = 1 + p.phase * p.max;
            p.mesh.scale.set(s, s, s);
            p.mesh.material.opacity = (1 - p.phase) * 0.9;
          });

          dashMat.dashSize = 1.4 + Math.sin(clock.elapsedTime * 2) * 0.4;

          const arr = pGeo.attributes.position.array;
          for (let i = 0; i < N; i++) {
            arr[i * 3 + 1] += dt * 3;
            if (arr[i * 3 + 1] > H + 120) arr[i * 3 + 1] = H;
          }
          pGeo.attributes.position.needsUpdate = true;

          controls.update();
          composer.render();
        })();

        // Tự động điều chỉnh kích thước khi resize
        window.addEventListener("resize", () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.position.z = 54 + Math.max(0, (1.5 - camera.aspect) * 28);
          camera.updateProjectionMatrix();
          composer.setSize(w, h);
        });
      },
    )
    .catch(() => {
      if (container) {
        container.innerHTML = `
        <div style="display:grid;place-items:center;height:100%;color:#94a3b8;text-align:center;padding:40px">
          <div>
            <p style="font-size:48px;margin:0">🗺️</p>
            <p style="font-size:14px;margin:12px 0 0">Bản đồ cần kết nối mạng ổn định để hiển thị.</p>
          </div>
        </div>`;
      }
    });
}

const mapSection =
  document.getElementById("areas") ||
  document.getElementById("map3d-container");
if (mapSection) {
  const mapObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        initMap3D();
        mapObserver.disconnect();
      }
    },
    { rootMargin: "400px" },
  );
  mapObserver.observe(mapSection);
}

/* =========================================================
     CRO: STICKY CTA (IntersectionObserver — 0 reflow)
     ========================================================= */
const stickyCta = document.getElementById("sticky-cta");
const contactSection = document.getElementById("contact");
const heroSection = document.querySelector(".hero");

if (stickyCta && heroSection && "IntersectionObserver" in window) {
  let heroOutOfView = false;
  let contactInView = false;

  const updateStickyCta = () => {
    if (heroOutOfView && !contactInView) {
      stickyCta.classList.add("visible");
    } else {
      stickyCta.classList.remove("visible");
    }
  };

  new IntersectionObserver(
    ([entry]) => {
      heroOutOfView = !entry.isIntersecting;
      updateStickyCta();
    },
    { threshold: 0 }
  ).observe(heroSection);

  if (contactSection) {
    new IntersectionObserver(
      ([entry]) => {
        contactInView = entry.isIntersecting;
        updateStickyCta();
      },
      { threshold: 0 }
    ).observe(contactSection);
  }
}

// Social Proof Toast Logic
const toast = document.getElementById("social-proof-toast");
const toastName = document.getElementById("toast-name");
const toastAction = document.getElementById("toast-action");

const names = [
  "Anh Khang",
  "Chị Mai",
  "Anh Tuấn",
  "Chị Lan",
  "Anh Hoàng",
  "Anh Vinh",
  "Chị Thảo",
  "Anh Minh",
  "Chị Ngọc",
  "Anh Đạt",
  "Chú Hùng",
  "Cô Yến",
  "Anh Sơn",
  "Chị Trâm",
  "Chị Hằng",
  "Anh Phong",
  "Chị Quyên",
  "Anh Cường",
  "Chị Phượng",
  "Anh Bách",
  "Chị Linh",
  "Anh Đức",
  "Chị Phương",
  "Anh Tài",
  "Chị Vy",
  "Anh Hưng",
  "Chị Trang",
  "Anh Huy",
  "Chị Hà",
  "Anh Bảo",
  "Chú Bình",
  "Cô Hoa",
  "Anh Hiếu",
  "Chị Dung",
  "Anh Vũ",
  "Chị Nhung",
  "Anh Trường",
  "Chị Oanh",
  "Anh Thành",
  "Chị Ngân",
  "Anh Tâm",
  "Chị My",
  "Anh Kiên",
  "Chị Thu",
  "Anh Tùng",
  "Chị Thúy",
  "Anh Nam",
  "Chị Liên",
  "Anh Hải",
  "Chị Yến",
  "Em Duy",
  "Em Vân",
  "Bác Long",
  "Bác Nga",
  "Anh Phát",
  "Chị Quỳnh",
  "Anh Lộc",
  "Chị Tiên",
  "Anh Luân",
  "Chị Trinh",
  "Anh Trung",
  "Chị Hương",
  "Anh Thắng",
  "Chị Tuyết",
  "Anh Quân",
  "Chị Loan",
  "Anh Dũng",
  "Chị Nhi",
  "Anh Lâm",
  "Chị Thủy",
  "Anh Phúc",
  "Chị Giang",
  "Anh Thiện",
  "Chị Thanh",
  "Anh Khoa",
  "Chị Huyền",
  "Anh Nghĩa",
  "Chị Châu",
  "Anh Trí",
  "Chị Ly",
  "Anh Tân",
  "Chị Kim",
  "Anh Hậu",
  "Chị Đào",
  "Anh Toàn",
  "Chị Sương",
  "Anh Nhật",
  "Chị Diệp",
  "Anh Sang",
  "Chị Tú",
  "Chú Thanh",
  "Cô Tuyến",
  "Anh Khôi",
  "Chị Thơ",
  "Anh Nguyên",
  "Chị Mơ",
  "Anh Thịnh",
  "Chị Trúc",
  "Anh Quang",
  "Chị Cẩm",
];
const locations = [
  "Q.1",
  "Q.2",
  "Q.3",
  "Q.4",
  "Q.5",
  "Q.7",
  "Q.9",
  "Q.10",
  "Q.12",
  "Gò Vấp",
  "Thủ Đức",
  "Tân Bình",
  "Tân Phú",
  "Bình Thạnh",
  "Phú Nhuận",
  "Hà Nội",
  "Đà Nẵng",
  "Bình Dương",
  "Biên Hòa",
  "Hải Phòng",
  "Cần Thơ",
  "Nha Trang",
  "Vũng Tàu",
  "Thanh Hóa",
  "Đà Lạt",
  "Huế",
  "Quảng Ninh",
  "Bắc Ninh",
  "Nghệ An",
  "Quy Nhơn",
];

function getRandomCustomer() {
  const name = names[Math.floor(Math.random() * names.length)];
  const loc = locations[Math.floor(Math.random() * locations.length)];
  return `${name} (${loc})`;
}
const actions = [
  "vừa đăng ký gói COMBO VIP",
  "đang nhận tư vấn lắp đặt",
  "vừa lắp xong gói GIGA",
  "đã đăng ký gói F-GAME",
  "vừa lắp FPT Camera AI",
  "đăng ký Internet 6 tháng (Tặng 1)",
  "vừa nâng cấp lên modem WiFi 6",
  "vừa lắp Combo Internet + Truyền hình",
  "đã đăng ký gói SKY tốc độ cao",
  "vừa yêu cầu khảo sát hạ tầng mạng",
];
function getRandomTimeAgo() {
  const r = Math.random();
  if (r < 0.25) return "vừa xong";
  if (r < 0.85) return `${Math.floor(Math.random() * 59) + 1} phút trước`;
  return `${Math.floor(Math.random() * 4) + 1} giờ trước`;
}

function showRandomToast() {
  if (!toast) return;
  const randomCustomer = getRandomCustomer();
  const randomAction = actions[Math.floor(Math.random() * actions.length)];
  const randomTime = getRandomTimeAgo();

  toastName.textContent = randomCustomer;
  toastAction.textContent = `${randomAction} (${randomTime})`;

  toast.classList.add("show");

  const displayDuration = Math.floor(3000 + Math.random() * 4000); // Hiển thị ngẫu nhiên từ 3 đến 7 giây
  setTimeout(() => {
    toast.classList.remove("show");
  }, displayDuration);
}

if (toast) {
  const firstDelay = Math.floor(5000 + Math.random() * 10000); // Lần xuất hiện đầu tiên sau 5-15s
  setTimeout(function triggerToast() {
    showRandomToast();
    const nextInterval = Math.floor(10000 + Math.random() * 25000); // Khoảng cách giữa 2 lần từ 10s đến 35s
    setTimeout(triggerToast, nextInterval);
  }, firstDelay);
}

/* =========================================================
     ADVANCED TRACKING & CRO LOGIC
     ========================================================= */
// 1. Page Load DataLayer Push
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: "page_data",
  page_title: document.title,
  page_url: window.location.href,
  page_type: "landing_page",
});

// 2. Scroll Depth Tracking (throttled)
const scrollMarks = { 25: false, 50: false, 75: false, 100: false };
let depthTicking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!depthTicking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        [25, 50, 75, 100].forEach((mark) => {
          if (scrollPercent >= mark && !scrollMarks[mark]) {
            scrollMarks[mark] = true;
            if (typeof gtag === "function")
              gtag("event", "scroll_depth", { depth: mark + "%" });
          }
        });
        depthTicking = false;
      });
      depthTicking = true;
    }
  },
  { passive: true },
);

// 3. Time on Page Tracking
const timeSegments = [
  { time: 30000, label: "< 30s" },
  { time: 120000, label: "30s - 2m" },
  { time: 300000, label: "2m - 5m" },
];
timeSegments.forEach((seg) => {
  setTimeout(() => {
    if (typeof gtag === "function")
      gtag("event", "time_on_page", { segment: seg.label });
  }, seg.time);
});

// 4. Exit Intent Popup
let exitIntentTriggered = false;
const exitPopup = document.getElementById("exit-popup");
// Exit intent popup — desktop only
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.addEventListener("mouseleave", (e) => {
    if (e.clientY < 0 && !exitIntentTriggered && exitPopup) {
      exitIntentTriggered = true;
      exitPopup.classList.add("show");
      if (typeof gtag === "function") gtag("event", "exit_intent_show");
    }
  });
}
if (exitPopup) {
  exitPopup.querySelector(".close-popup").addEventListener("click", () => {
    exitPopup.classList.remove("show");
  });
}

// 5. Countdown timer — end of week (Sunday 23:59:59)
const timer = document.getElementById("countdown-timer");
const announce = document.getElementById("countdown-announce");
if (timer) {
  function getNextSundayEnd() {
    const now = new Date();
    const end = new Date(now);
    const daysUntilSunday = now.getDay() === 0 ? 0 : 7 - now.getDay();
    end.setDate(now.getDate() + daysUntilSunday);
    end.setHours(23, 59, 59, 0);
    if (end <= now) end.setDate(end.getDate() + 7);
    return end;
  }

  let endOfWeek = getNextSundayEnd();
  let tickCount = 0;

  function updateCountdown() {
    const now = new Date();
    let diff = endOfWeek - now;
    if (diff <= 0) {
      endOfWeek = getNextSundayEnd();
      diff = endOfWeek - now;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const hh = h.toString().padStart(2, "0");
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    const dd = d > 0 ? `<span class="t-unit">${d}</span> ngày ` : "";
    const text = `${dd}<span class="t-unit">${hh}</span>:<span class="t-unit">${mm}</span>:<span class="t-unit">${ss}</span>`;
    timer.innerHTML = text;

    // Announce cho screen reader mỗi 5 phút (300 ticks)
    tickCount++;
    if (announce && tickCount % 300 === 0) {
      announce.textContent = `Ưu đãi kết thúc sau ${text}`;
    }
  }
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

// 6. Social Proof Weekly Counter
const socialProofCountEl = document.getElementById("social-proof-count");
if (socialProofCountEl) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const currentDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Treat Mon as 1, Sun as 7

  // Base count scales up as the week progresses (Day 1: ~25, Day 7: ~160)
  const baseCount = currentDay * 23 + (now.getDate() % 5);

  // Calculate current week string (e.g. "2026-W30")
  const startDate = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now - startDate) / (24 * 60 * 60 * 1000));
  const weekNumber =
    now.getFullYear() + "-W" + Math.ceil((now.getDay() + 1 + days) / 7);

  const storedWeek = localStorage.getItem("fpt_sp_week");
  const storedCount = parseInt(localStorage.getItem("fpt_sp_count"), 10);

  let displayCount = baseCount;

  // If we are in the same week, ensure the number only goes UP, never down
  if (
    storedWeek === weekNumber &&
    !isNaN(storedCount) &&
    storedCount > displayCount
  ) {
    displayCount = storedCount;
  }

  socialProofCountEl.textContent = displayCount;
  localStorage.setItem("fpt_sp_week", weekNumber);
  localStorage.setItem("fpt_sp_count", displayCount);

  // Auto increment by 1-3 occasionally while user is on the page
  setInterval(() => {
    if (Math.random() > 0.6) {
      displayCount += Math.floor(Math.random() * 3) + 1;
      socialProofCountEl.textContent = displayCount;
      localStorage.setItem("fpt_sp_count", displayCount);
    }
  }, 45000); // Check every 45 seconds
}

// 7. Chat Widget Logic
let chatToggle = document.getElementById("chat-toggle");
let chatWidget = document.getElementById("chat-widget");

const scriptTag = document.querySelector('script[src*="script"]');
const scriptSrc = scriptTag ? scriptTag.getAttribute("src") : "";
const assetBase = scriptSrc.replace(/js\/script(?:\.min)?\.js.*$/, "") || "";

if (!chatToggle) {
  let floatingActions = document.querySelector(".floating-actions");
  if (!floatingActions) {
    floatingActions = document.createElement("div");
    floatingActions.className = "floating-actions";
    floatingActions.setAttribute("aria-label", "Liên hệ nhanh");
    floatingActions.innerHTML = `<a href="tel:0383900321" class="floating-call" aria-label="Gọi hotline">☎ <span>Gọi ngay</span></a>`;
    document.body.appendChild(floatingActions);
  }
  const btnHtml = `
    <button class="chat-toggle-btn" id="chat-toggle" aria-label="Mở chat">
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chat-icon">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
      </svg>
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="close-icon" style="display: none">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>`;
  floatingActions.insertAdjacentHTML("beforeend", btnHtml);
  chatToggle = document.getElementById("chat-toggle");
}

if (!chatWidget) {
  const widgetHtml = `
  <div class="chat-widget" id="chat-widget">
    <div class="chat-widget-header">
      <div class="chat-widget-brand">
        <div class="chat-widget-logo">
          <img src="${assetBase}assets/images/main/logo.webp" alt="FPT Telecom" width="28" height="28" style="object-fit: contain; background: #fff; border-radius: 50%; padding: 2px;">
        </div>
        <span>FPT Telecom</span>
        <span class="chat-online-dot"></span>
      </div>
      <div class="chat-widget-controls">
        <button type="button" aria-label="Chuyển sang Live Chat" title="Chat trực tiếp với nhân viên" class="chat-ctrl-btn" onclick="typeof switchToLiveChat === 'function' ? switchToLiveChat() : null">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style="vertical-align: middle">
            <path d="M12 1a9 9 0 0 0-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 0 0-9-9z"></path>
          </svg>
        </button>
        <button type="button" id="chat-minimize" aria-label="Thu nhỏ" class="chat-ctrl-btn">−</button>
      </div>
    </div>
    <div class="chat-widget-body">
      <div id="chat-messages" class="chat-messages">
        <div class="chat-msg bot-msg">
          <div class="msg-bubble">
            Chào bạn! Mình là Trợ lý ảo FPT Telecom. Mình có thể tư vấn gói cước, hỗ trợ kỹ thuật hoặc giải đáp các thắc mắc về dịch vụ. Bạn cần mình giúp gì ạ?
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <textarea id="chat-input" aria-label="Nhập câu hỏi chat" placeholder="Nhập câu hỏi của bạn..." rows="1" autocomplete="off"></textarea>
        <button id="chat-send-btn" aria-label="Gửi tin nhắn">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML("beforeend", widgetHtml);
  chatWidget = document.getElementById("chat-widget");
}

const chatMinimize = document.getElementById("chat-minimize");
const chatIcon = chatToggle?.querySelector(".chat-icon");
const closeIcon = chatToggle?.querySelector(".close-icon");

if (chatToggle && chatWidget) {
  const popupAudio = new Audio(assetBase + "assets/music/thongbao.mp3");
  popupAudio.preload = "auto";

  let audioUnlocked = false;
  const initAudio = () => {
    if (audioUnlocked) return;
    popupAudio.muted = true; // Chạy nền im lặng để trình duyệt dễ dàng chấp nhận
    const playPromise = popupAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          popupAudio.pause();
          popupAudio.currentTime = 0;
          popupAudio.muted = false; // Trả lại âm thanh bình thường
          audioUnlocked = true;
          ["click", "touchstart", "keydown"].forEach((evt) =>
            document.removeEventListener(evt, initAudio),
          );
        })
        .catch(() => {
          popupAudio.muted = false;
        });
    }
  };

  ["click", "touchstart", "keydown"].forEach((evt) =>
    document.addEventListener(evt, initAudio),
  );

  const playDing = () => {
    try {
      popupAudio.currentTime = 0;
      const playPromise = popupAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) =>
          console.warn("Trình duyệt chặn phát âm thanh tự động:", err),
        );
      }
    } catch (e) {}
  };

  let userInteractedWithChat = false;
  let hasPlayedSound = false;

  const toggleChat = (isAutoOpen = false) => {
    const isOpen = chatWidget.classList.toggle("open");

    if (isOpen && isAutoOpen && !hasPlayedSound) {
      playDing();
      hasPlayedSound = true;
    }

    if (chatIcon && closeIcon) {
      chatIcon.style.display = isOpen ? "none" : "block";
      closeIcon.style.display = isOpen ? "block" : "none";
    }
  };

  chatToggle.addEventListener("click", () => {
    userInteractedWithChat = true;
    hasPlayedSound = true; // Hủy âm thanh nếu user tự bấm
    toggleChat(false);
  });

  // Auto open popup after 10 seconds
  setTimeout(() => {
    if (!chatWidget.classList.contains("open") && !userInteractedWithChat) {
      toggleChat(true);
    }
  }, 10000);
  if (chatMinimize) {
    chatMinimize.addEventListener("click", () => {
      chatWidget.classList.remove("open");
      if (chatIcon && closeIcon) {
        chatIcon.style.display = "block";
        closeIcon.style.display = "none";
      }
    });
  }

  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  const chatHistory = []; // Lưu ngữ cảnh trò chuyện

  if (chatInput && chatSendBtn && chatMessages) {
    const escapeText = (str) => {
      if (typeof str !== "string") return "";
      return str.replace(/[&<>'"]/g, (tag) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[tag] || tag));
    };

    const renderPricingCardsToBubble = (bubble, cards) => {
      if (!cards || !Array.isArray(cards) || cards.length === 0) return;
      const cardsWrap = document.createElement("div");
      cardsWrap.className = "pricing-cards-container";

      cards.forEach((c) => {
        const card = document.createElement("article");
        card.className = "pricing-card-3d";
        card.setAttribute("role", "article");
        card.setAttribute("aria-label", c.name || "Gói cước FPT");

        const badgeHtml = c.promo
          ? `<div class="card-badge">Ưu đãi</div>`
          : "";
        const speedHtml = c.speed
          ? `<div class="card-speed-badge">⚡ ${escapeText(c.speed)}</div>`
          : "";
        const equipHtml = c.equipment
          ? `<li><span class="feat-icon">✓</span> <span>${escapeText(c.equipment)}</span></li>`
          : "";
        const promoHtml = c.promo
          ? `<li><span class="feat-icon">🎁</span> <span>${escapeText(c.promo)}</span></li>`
          : "";

        card.innerHTML = `
          ${badgeHtml}
          <div>
            <div class="card-title">${escapeText(c.name || "Gói cước FPT")}</div>
            ${speedHtml}
            <div class="card-price-wrap">
              <div class="card-price">${escapeText(c.price || "")}</div>
            </div>
            <ul class="card-features-list">
              ${equipHtml}
              ${promoHtml}
              <li><span class="feat-icon">✓</span> <span>Khảo sát & ký online 24h</span></li>
            </ul>
          </div>
          <button class="card-cta-btn" type="button" aria-label="Đăng ký ${escapeText(c.name || "")}">
            <span>ĐĂNG KÝ NGAY</span> <span>→</span>
          </button>
        `;

        const ctaBtn = card.querySelector(".card-cta-btn");
        ctaBtn.addEventListener("click", () => {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: "card_cta_click",
            package_name: c.name,
            package_price: c.price,
          });

          if (typeof window.openRegisterModal === "function") {
            window.openRegisterModal(c.name);
          }
        });

        cardsWrap.appendChild(card);
      });

      bubble.appendChild(cardsWrap);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "card_impression",
        card_count: cards.length,
        packages: cards.map((c) => c.name),
      });
    };

    const appendMessage = (text, sender, cards = null, showHotline = false) => {
      const msgDiv = document.createElement("div");
      msgDiv.className = `chat-msg ${sender}-msg`;
      const bubble = document.createElement("div");
      bubble.className = "msg-bubble";

      const parts = text.split(/(\*\*.*?\*\*|\n)/g);
      parts.forEach((part) => {
        if (!part) return;
        if (part === "\n") {
          bubble.appendChild(document.createElement("br"));
        } else if (
          part.startsWith("**") &&
          part.endsWith("**") &&
          part.length >= 4
        ) {
          const b = document.createElement("b");
          b.textContent = part.slice(2, -2);
          bubble.appendChild(b);
        } else {
          bubble.appendChild(document.createTextNode(part));
        }
      });

      // Render 3D Pricing Cards if present (Milestone 2.6)
      if (cards && Array.isArray(cards) && cards.length > 0) {
        renderPricingCardsToBubble(bubble, cards);
      }

      // Render Hotline Fallback UI if needed
      if (showHotline) {
        const hotlineBox = document.createElement("div");
        hotlineBox.className = "chat-hotline-fallback";
        hotlineBox.innerHTML = `
          <p>📞 Cần tư vấn nhanh theo khu vực?</p>
          <a href="tel:0383900321">GỌI HOTLINE: 0383 900 321</a>
        `;
        bubble.appendChild(hotlineBox);
      }

      msgDiv.appendChild(bubble);
      chatMessages.appendChild(msgDiv);
      requestAnimationFrame(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      });
      return msgDiv;
    };

    // Xóa session cũ khi tải lại trang theo yêu cầu
    localStorage.removeItem("chat_session_id");
    localStorage.removeItem("chat_visitor_name");
    let sessionId = null;
    const chatWidgetBody = document.querySelector(".chat-widget-body");

    function promptForNameAndStart(onComplete) {
      const nameOverlay = document.createElement("div");
      nameOverlay.id = "chat-name-overlay";
      nameOverlay.style.cssText =
        "position:absolute;top:0;left:0;width:100%;height:100%;background:#fff;z-index:10;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:20px;box-sizing:border-box;border-radius:0 0 16px 16px;";
      nameOverlay.innerHTML = `
        <img src="${assetBase}assets/images/main/logo.webp" alt="FPT Logo" style="width: 48px; height: 48px; object-fit: contain; margin-bottom: 12px; border-radius: 50%; padding: 2px; background: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
        <h3 style="margin:0 0 10px 0;color:#333;font-size:16px;">Chào bạn! 👋</h3>
        <input type="text" id="chat-name-input" placeholder="Họ và tên..." style="width:100%;padding:12px 14px;border:1px solid #cbd5e1;border-radius:8px;margin-bottom:15px;font-size:16px;outline:none;box-sizing:border-box;font-family:inherit;">
        <button id="chat-name-submit" style="width:100%;padding:12px;background:#0066ff;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer;font-weight:600;">Bắt đầu chat</button>
      `;
      chatWidgetBody.appendChild(nameOverlay);

      const submitBtn = nameOverlay.querySelector("#chat-name-submit");
      const nameInput = nameOverlay.querySelector("#chat-name-input");
      requestAnimationFrame(() => nameInput.focus());

      const startChat = () => {
        let name = nameInput.value.trim();
        if (!name) name = "Khách";

        localStorage.setItem("chat_visitor_name", name);

        // Lọc dấu tiếng Việt và ký tự đặc biệt để làm ID an toàn
        const safeName = name
          .normalize("NFD")
          .replace(/[\\u0300-\\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]/g, "");
        const randomStr = window.crypto
          .getRandomValues(new Uint32Array(1))[0]
          .toString(36)
          .substring(0, 6);
        sessionId = (safeName || "Khach") + "_" + randomStr;
        localStorage.setItem("chat_session_id", sessionId);
        nameOverlay.remove();
        if (onComplete) onComplete();
      };

      submitBtn.onclick = startChat;
      nameInput.onkeydown = (e) => {
        if (e.key === "Enter") startChat();
      };
    }

    if (!sessionId) {
      promptForNameAndStart();
    }
    let chatMode = "ai"; // Mặc định là chat với AI
    let pollInterval;
    let pollTimerMs = 2500;
    let isClosed = false;
    let lastOwnerMsgId = 0;

    const API_ENDPOINT = atob(
      "aHR0cHM6Ly9tYW4tY2hhdGJvdC50dm0xOTYyNC53b3JrZXJzLmRldi9hcGkvY2hhdA==",
    );
    const POLL_ENDPOINT = API_ENDPOINT.replace("/api/chat", "/api/poll");
    const CLOSE_ENDPOINT = API_ENDPOINT.replace("/api/chat", "/api/close");

    function showClosedNotice(reason) {
      const notice = document.createElement("div");
      notice.className = "chat-msg bot-msg";

      let msgText = "Phiên chat đã tự động đóng do không hoạt động sau 5 phút.";
      if (reason === "session_closed")
        msgText = "Phiên chat với nhân viên đã kết thúc.";

      notice.innerHTML = `<div class="msg-bubble" style="background: #fff3cd; color: #856404; font-style: italic;">${msgText}</div>`;
      chatMessages.appendChild(notice);

      const btnDiv = document.createElement("div");
      btnDiv.className = "chat-msg bot-msg";
      btnDiv.style.justifyContent = "center";

      const btn = document.createElement("button");
      btn.textContent = "💬 Bắt đầu chat với AI";
      btn.style.cssText =
        "display:block;margin:12px auto;padding:10px 20px;background:#0066ff;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:14px;";

      btn.onclick = () => {
        localStorage.removeItem("chat_session_id");
        promptForNameAndStart(() => {
          lastOwnerMsgId = 0;
          isClosed = false;
          chatMode = "ai";
          chatHistory.length = 0;

          notice.remove();
          btnDiv.remove();

          chatInput.disabled = false;
          chatSendBtn.disabled = false;
          chatInput.placeholder = "Nhập câu hỏi của bạn...";

          appendMessage(
            "Chào bạn! 👋 Mình là trợ lý ảo FPT Telecom. Bạn cần tư vấn gì ạ?",
            "bot",
          );
        });
      };

      btnDiv.appendChild(btn);
      chatMessages.appendChild(btnDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      chatInput.disabled = true;
      chatSendBtn.disabled = true;
      chatInput.placeholder = "Phiên đã đóng. Bấm nút trên để chat mới.";
    }

    const pollMessages = async () => {
      if (chatMode !== "live" || isClosed) return;
      try {
        const res = await fetch(
          `${POLL_ENDPOINT}?session=${sessionId}&after=${lastOwnerMsgId}`,
        );
        if (!res.ok) return;
        const data = await res.json();

        if (data.closed) {
          isClosed = true;
          if (pollInterval) clearInterval(pollInterval);
          showClosedNotice(data.reason);
          return;
        }

        if (data.messages && data.messages.length > 0) {
          for (const m of data.messages) {
            appendMessage(m.text, "bot");
            chatHistory.push({ role: "model", text: m.text });
            lastOwnerMsgId = Math.max(lastOwnerMsgId, m.id);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    function startLiveChatPolling() {
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(pollMessages, pollTimerMs);
    }

    // Chuyển sang chế độ kết nối nhân viên
    window.switchToLiveChat = async function () {
      if (chatMode === "live" || isClosed) return;
      chatMode = "live";
      appendMessage(
        "✅ Đã gửi yêu cầu kết nối trực tiếp với nhân viên hỗ trợ (Tiểu Mẫn FPT). Bạn vui lòng chờ trong giây lát nhé!",
        "bot",
      );

      try {
        await fetch(API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: "Khách hàng vừa nhấn nút yêu cầu chat trực tiếp với nhân viên.",
            history: chatHistory,
            session: sessionId,
            mode: "live",
          }),
        });
      } catch (e) {
        console.error(e);
      }

      startLiveChatPolling();
    };

    // Tối ưu Polling khi ẩn/hiện Tab
    document.addEventListener("visibilitychange", () => {
      if (chatMode !== "live" || isClosed) return;
      if (document.hidden) {
        pollTimerMs = 15000; // Giãn 15s khi ẩn tab
      } else {
        pollTimerMs = 2500; // Trở lại 2.5s khi mở tab
        pollMessages(); // Poll ngay lập tức 1 phát cho đỡ trễ
      }
      startLiveChatPolling();
    });

    const sendMessage = async () => {
      const message = chatInput.value.trim();
      if (!message || isClosed) return;

      appendMessage(message, "user");
      chatHistory.push({ role: "user", text: message });

      chatInput.value = "";
      chatInput.style.height = "auto";
      chatSendBtn.disabled = true;

      const typingIndicator = document.createElement("div");
      typingIndicator.className = "chat-msg bot-msg";
      typingIndicator.innerHTML = `<div class="msg-bubble typing-indicator"><span></span><span></span><span></span></div>`;
      chatMessages.appendChild(typingIndicator);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      try {
        const isAiMode = chatMode === "ai";
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(isAiMode ? { Accept: "text/event-stream, application/json" } : {}),
          },
          body: JSON.stringify({
            text: message,
            history: chatHistory,
            session: sessionId,
            mode: chatMode,
            stream: isAiMode,
          }),
        });

        if (typingIndicator.parentNode) {
          chatMessages.removeChild(typingIndicator);
        }

        const contentType = response.headers.get("content-type") || "";

        // Handle SSE Streaming (Real-time AI Token Typing)
        if (isAiMode && contentType.includes("text/event-stream") && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = "";
          let streamCards = null;

          const msgDiv = document.createElement("div");
          msgDiv.className = "chat-msg bot-msg";
          const bubble = document.createElement("div");
          bubble.className = "msg-bubble";
          msgDiv.appendChild(bubble);
          chatMessages.appendChild(msgDiv);

          let sseBuffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            sseBuffer += decoder.decode(value, { stream: true });
            const lines = sseBuffer.split("\n");
            sseBuffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data: ")) continue;
              const payloadStr = trimmed.slice(6).trim();
              if (payloadStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(payloadStr);
                if (parsed.chunk || parsed.text) {
                  accumulatedText += (parsed.chunk || parsed.text);
                  bubble.textContent = accumulatedText;
                  chatMessages.scrollTop = chatMessages.scrollHeight;
                }
                if (parsed.cards && Array.isArray(parsed.cards)) {
                  streamCards = parsed.cards;
                }
              } catch (pErr) {}
            }
          }

          // Format bold markers & markdown formatting
          if (accumulatedText) {
            bubble.innerHTML = "";
            const parts = accumulatedText.split(/(\*\*.*?\*\*|\n)/g);
            parts.forEach((part) => {
              if (!part) return;
              if (part === "\n") {
                bubble.appendChild(document.createElement("br"));
              } else if (
                part.startsWith("**") &&
                part.endsWith("**") &&
                part.length >= 4
              ) {
                const b = document.createElement("b");
                b.textContent = part.slice(2, -2);
                bubble.appendChild(b);
              } else {
                bubble.appendChild(document.createTextNode(part));
              }
            });

            chatHistory.push({ role: "model", text: accumulatedText });
          }

          // Render 3D Pricing Cards if returned
          if (streamCards && streamCards.length > 0) {
            renderPricingCardsToBubble(bubble, streamCards);
          }

          chatMessages.scrollTop = chatMessages.scrollHeight;
        } else {
          // Standard JSON (from Edge Cache HIT or Live Chat)
          const data = await response.json();

          if (isAiMode) {
            if (data.reply) {
              appendMessage(data.reply, "bot", data.cards, data.show_hotline);
              chatHistory.push({ role: "model", text: data.reply });
            } else {
              appendMessage(
                data.error || "Xin lỗi, hệ thống AI đang bận.",
                "bot",
              );
            }
          } else {
            // Live Chat Mode
            if (data.error) {
              appendMessage(data.error, "bot");
            }
          }
        }
      } catch (err) {
        if (typingIndicator.parentNode)
          chatMessages.removeChild(typingIndicator);
        appendMessage("Xin lỗi, không thể kết nối đến máy chủ.", "bot");
      } finally {
        chatSendBtn.disabled = false;
        if (!isClosed) chatInput.focus();
      }
    };

    chatSendBtn.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    chatInput.addEventListener("input", function () {
      this.style.height = "auto";
      this.style.height = this.scrollHeight + "px";
    });
  }

  window.openPolicyModal = (e) => {
    if (e) e.preventDefault();
    const modal = document.getElementById("policy-modal");
    if (modal) modal.classList.add("show");
    document.body.style.overflow = "hidden"; // Ngăn cuộn trang nền
  };

  window.closePolicyModal = () => {
    const modal = document.getElementById("policy-modal");
    if (modal) modal.classList.remove("show");
    document.body.style.overflow = "";
  };

  // FAQ Accordion Logic
  const faqDetails = document.querySelectorAll(".faq-list details");
  if (faqDetails.length > 0) {
    faqDetails.forEach((detail) => {
      detail.addEventListener("click", (e) => {
        if (!detail.open) {
          faqDetails.forEach((d) => {
            if (d !== detail && d.open) d.open = false;
          });
        }
      });
    });
  }
}

/* =========================================================
     GSAP & SCROLLTRIGGER PREMIUM ANIMATIONS
     ========================================================= */
const initPremiumAnimations = () => {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined")
    return;

  gsap.registerPlugin(ScrollTrigger);

  // 1b. Parallax Hero Effect (Trôi nổi 3D mượt mà)
  if (document.querySelector(".hero-visual")) {
    gsap.to(".hero-visual", {
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.5,
      },
      y: 80,
      ease: "none",
    });
  }

  // 1c. Kích hoạt toàn bộ các phần tử .scroll-animate bị bỏ sót (Tiêu đề, Text...)
  const animateElements = gsap.utils.toArray(".scroll-animate:not(.animated)");
  animateElements.forEach((el) => {
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        toggleActions: "play none none none",
      },
      y: 35,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
      clearProps: "transform,opacity",
    });
    el.classList.add("animated");
  });

  // 2. Package Grid (Scroll Fade-up)
  gsap.from(".package", {
    scrollTrigger: {
      trigger: ".package-grid",
      start: "top 80%",
    },
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: "back.out(1.2)",
    clearProps: "transform,opacity",
  });

  // 3. Triple Combo Banner (Scale & Glow)
  gsap.from(".triple", {
    scrollTrigger: {
      trigger: ".triple",
      start: "top 85%",
    },
    scale: 0.95,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
    clearProps: "transform,opacity",
  });

  // 4. Offers List (Slide-in)
  gsap.from(".offer-list > div", {
    scrollTrigger: {
      trigger: ".offer-list",
      start: "top 85%",
    },
    x: -30,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: "power2.out",
    clearProps: "transform,opacity",
  });

  // 5. Testimonials (Scroll Fade-up)
  gsap.from(".testimonial-grid figure", {
    scrollTrigger: {
      trigger: ".testimonial-grid",
      start: "top 85%",
    },
    y: 40,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: "power2.out",
    clearProps: "transform,opacity",
  });

  // 6. Tính năng nổi bật (Features Stagger)
  gsap.from(".feature-card", {
    scrollTrigger: {
      trigger: ".feature-grid",
      start: "top 85%",
    },
    y: 40,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15,
    ease: "back.out(1.2)",
    clearProps: "transform,opacity",
  });

  // 7. Tin tức & Khuyến mãi (News Cards)
  gsap.from(".news-card", {
    scrollTrigger: {
      trigger: ".news-grid",
      start: "top 85%",
    },
    y: 30,
    opacity: 0,
    duration: 0.5,
    stagger: 0.15,
    ease: "power2.out",
    clearProps: "transform,opacity",
  });

  // 8. Magnetic Button Effect (Nút bấm từ tính)
  if (hasFinePointer) {
    const magneticBtns = document.querySelectorAll(
      ".btn, .outline-btn, .magnetic-btn",
    );
    magneticBtns.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.3,
          y: y * 0.3,
          duration: 0.4,
          ease: "power2.out",
        });
      });
      btn.addEventListener("mouseleave", () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)",
        });
      });
    });
  }

  // 9. Text Splitting Animation (Vanilla JS -> GSAP)
  // Tính năng tách chữ để tạo hiệu ứng reveal mượt mà
  const splitTextElements = document.querySelectorAll("[data-split]");
  splitTextElements.forEach((el) => {
    const type = el.getAttribute("data-split"); // 'chars' hoặc 'lines'
    const text = el.innerText;
    el.textContent = ""; // Xóa nội dung cũ (Fixed CodeQL DOM text reinterpreted as HTML)

    if (type === "chars") {
      const chars = text.split("");
      chars.forEach((char) => {
        const wrapper = document.createElement("span");
        wrapper.className = "char-wrapper";
        const inner = document.createElement("span");
        inner.className = "char";
        if (char === " ") {
          inner.textContent = "\u00A0"; // Use non-breaking space character to fix CodeQL warning
        } else {
          inner.textContent = char;
        }
        wrapper.appendChild(inner);
        el.appendChild(wrapper);
      });

      gsap.to(el.querySelectorAll(".char"), {
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
        },
        y: "0%",
        opacity: 1,
        duration: 0.6,
        stagger: 0.02,
        ease: "power3.out",
      });
    } else if (type === "lines") {
      // Phân tách đơn giản dựa trên dấu phẩy hoặc câu để demo (thay thế SplitText trả phí)
      const lines = text.split(/([.,])/g);
      el.textContent = ""; // Fixed CodeQL DOM HTML warning
      let currentLine = "";
      lines.forEach((part) => {
        currentLine += part;
        if (part === "," || part === ".") {
          const wrapper = document.createElement("span");
          wrapper.className = "line-wrapper";
          const innerSpan = document.createElement("span");
          innerSpan.className = "line";
          innerSpan.textContent = currentLine;
          wrapper.appendChild(innerSpan);
          el.appendChild(wrapper);
          el.appendChild(document.createTextNode(" "));
          currentLine = "";
        }
      });
      if (currentLine.trim() !== "") {
        const wrapper = document.createElement("span");
        wrapper.className = "line-wrapper";
        const innerSpan = document.createElement("span");
        innerSpan.className = "line";
        innerSpan.textContent = currentLine;
        wrapper.appendChild(innerSpan);
        el.appendChild(wrapper);
      }

      gsap.to(el.querySelectorAll(".line"), {
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
        },
        y: "0%",
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
      });
    }
  });
};

// --- Header Glassmorphism & Scroll Observer (AOS-lite) ---
const header = document.querySelector(".header");
const scrollObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        scrollObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px 40px 0px" },
);

const vh = window.innerHeight || document.documentElement.clientHeight;
document
  .querySelectorAll(".fade-up, .slide-left, .slide-right")
  .forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < vh) {
      el.classList.add("is-visible");
    } else {
      scrollObserver.observe(el);
    }
  });

window.addEventListener(
  "scroll",
  () => {
    if (header && window.scrollY > 50) {
      header.classList.add("sticky-header");
    } else if (header) {
      header.classList.remove("sticky-header");
    }
  },
  { passive: true },
);
// ---------------------------------------------------------

// Ensure GSAP is available before initializing (defer load order fix)
function tryInitGSAP(attempts) {
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    initPremiumAnimations();
  } else if (attempts > 0) {
    setTimeout(() => tryInitGSAP(attempts - 1), 200);
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => tryInitGSAP(15));
} else {
  tryInitGSAP(15);
}

/* =======================================================
   PREMIUM INTERACTION EFFECTS
   ======================================================= */

// --- Ripple Click Effect ---
document.querySelectorAll(".btn, .btn-orange, .outline-btn").forEach((btn) => {
  btn.style.position = "relative";
  btn.style.overflow = "hidden";
  btn.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    ripple.className = "ripple-effect";
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = e.clientX - rect.left - size / 2 + "px";
    ripple.style.top = e.clientY - rect.top - size / 2 + "px";
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// --- Count-up Animation for Trust Stats ---
function animateCountUp(el) {
  const text = el.textContent.trim();
  // Extract number part (with dots/commas) and suffix part
  const match = text.match(/^([0-9.,]+)(.*)$/);
  if (!match) return;

  const targetStr = match[1];
  const suffix = match[2];
  const target = targetStr.replace(/[^0-9]/g, "");

  if (!target) return;
  const end = parseInt(target, 10);
  const duration = 1600;
  const step = duration / end;
  let current = 0;
  const timer = setInterval(() => {
    current += Math.ceil(end / 60);
    if (current >= end) {
      current = end;
      clearInterval(timer);
      el.classList.add("count-done");
    }
    el.textContent = current.toLocaleString("vi-VN") + suffix;
  }, step);
}

const trustObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll("b").forEach(animateCountUp);
        trustObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 },
);

const trustSection = document.querySelector(".trust");
if (trustSection) trustObserver.observe(trustSection);

// --- Cursor Spotlight (desktop only) ---
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const spotlight = document.createElement("div");
  spotlight.style.cssText = `
    position:fixed; pointer-events:none; z-index:9998;
    width:320px; height:320px; border-radius:50%;
    background: radial-gradient(circle, rgba(6,101,245,0.07) 0%, transparent 70%);
    transform:translate(-50%,-50%);
    transition:opacity 0.4s ease;
    opacity:0;
  `;
  document.body.appendChild(spotlight);
  document.addEventListener("mousemove", (e) => {
    spotlight.style.left = e.clientX + "px";
    spotlight.style.top = e.clientY + "px";
    spotlight.style.opacity = "1";
  });
  document.addEventListener("mouseleave", () => {
    spotlight.style.opacity = "0";
  });
}

// --- Staggered Section Entrance (scroll-animate) ---
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
);

document.querySelectorAll(".scroll-animate").forEach((el) => {
  sectionObserver.observe(el);
});

// --- Support Form Toggle ---
window.toggleSupportForm = function (btn) {
  const form = btn.closest("form");
  if (!form) return;
  const regFields = form.querySelector("#registration-fields");
  const supportFields = form.querySelector("#support-fields");
  const submitBtn = form.querySelector("#formSubmitBtn") || form.querySelector("#main-submit-btn") || form.querySelector('button[type="submit"]');
  const formTypeInput = form.querySelector("#form_type");

  const regPhone = form.querySelector("#regPhone");
  const regAddress = form.querySelector("#regAddress");
  const regSelects = regFields ? regFields.querySelectorAll("select") : [];
  const supportContactInfo = form.querySelector("#supportContactInfo");
  const supportContent = form.querySelector("#supportContent");

  const isSupport = supportFields && supportFields.style.display !== "none";

  if (!isSupport) {
    // Switch to Support Mode
    if (regFields) regFields.style.display = "none";
    if (supportFields) supportFields.style.display = "block";
    
    if (regPhone) { regPhone.required = false; regPhone.disabled = true; }
    if (regAddress) { regAddress.required = false; regAddress.disabled = true; }
    regSelects.forEach((s) => (s.disabled = true));

    if (supportContactInfo) {
      supportContactInfo.required = true;
      supportContactInfo.disabled = false;
      supportContactInfo.focus();
    }
    if (supportContent) {
      supportContent.required = true;
      supportContent.disabled = false;
    }
    if (formTypeInput) formTypeInput.value = "support";
    if (submitBtn) submitBtn.innerHTML = "GỬI YÊU CẦU HỖ TRỢ →";
    btn.innerHTML = "← Quay lại đăng ký gói cước mới";
  } else {
    // Switch back to Registration Mode
    if (regFields) regFields.style.display = "block";
    if (supportFields) supportFields.style.display = "none";

    if (regPhone) { regPhone.required = true; regPhone.disabled = false; }
    if (regAddress) { regAddress.required = true; regAddress.disabled = false; }
    regSelects.forEach((s) => (s.disabled = false));

    if (supportContactInfo) {
      supportContactInfo.required = false;
      supportContactInfo.disabled = true;
    }
    if (supportContent) {
      supportContent.required = false;
      supportContent.disabled = true;
    }
    if (formTypeInput) formTypeInput.value = "registration";
    if (submitBtn) submitBtn.innerHTML = "ĐĂNG KÝ NHẬN KHUYẾN MÃI NGAY →";
    btn.innerHTML = "Nhập yêu cầu hỗ trợ";
  }
};

/* =========================================================
   NEW MODALS (POPUP 1 & 2) INJECTION & LOGIC
   ========================================================= */
const isPagesDir = (window.location.pathname.includes('/pages/') || (window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('index.html')));
const policyHref = isPagesDir ? 'chinh-sach.html#privacy' : 'pages/chinh-sach.html#privacy';

const modalsHTML = `
<style>
.fpt-modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  z-index: 100000;
  display: flex; justify-content: center; align-items: center;
  opacity: 0; pointer-events: none;
  transition: opacity 0.3s ease;
}
.fpt-modal-overlay.show {
  opacity: 1; pointer-events: auto;
}
.fpt-modal-content {
  background: white;
  width: 90%; max-width: 440px;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.15);
  transform: translateY(20px);
  transition: transform 0.3s ease;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
}
.fpt-modal-overlay.show .fpt-modal-content {
  transform: translateY(0);
}
.modal-close {
  position: absolute; top: 16px; right: 16px;
  background: none; border: none; font-size: 28px;
  color: #64748b; cursor: pointer; line-height: 1;
}
.modal-close:hover { color: #0f172a; }
.modal-title {
  color: #0369a1; font-size: 24px; font-weight: 800;
  text-align: center; margin: 0 0 24px 0;
}

/* Form Styles inside Modal */
.fpt-modal-content .form-group {
  margin-bottom: 16px;
}
.fpt-modal-content label:not(.checkbox-label) {
  display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 6px;
}
.fpt-modal-content input:not([type="checkbox"]), .fpt-modal-content textarea {
  width: 100%; border: 1px solid #cbd5e1; border-radius: 10px;
  padding: 12px 16px; font-size: 14px; color: #334155; font-family: inherit;
  outline: none; transition: border-color 0.2s;
}
.fpt-modal-content input:not([type="checkbox"]):focus, .fpt-modal-content textarea:focus {
  border-color: #38bdf8; box-shadow: 0 0 0 3px rgba(56,189,248,0.1);
}
.fpt-modal-content .consent-group {
  background: #f0fdf4 !important;
  border: 1px solid #bbf7d0 !important;
  border-radius: 12px !important;
  padding: 12px 14px !important;
  margin: 14px 0 10px 0 !important;
  box-shadow: 0 1px 3px rgba(22, 101, 52, 0.05) !important;
}
.fpt-modal-content .checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: flex-start !important;
  gap: 10px !important;
  font-size: 12.5px !important;
  color: #166534 !important;
  font-weight: 500 !important;
  line-height: 1.45 !important;
  cursor: pointer !important;
  text-align: left !important;
  margin: 0 !important;
  user-select: none !important;
}
.fpt-modal-content .checkbox-label input[type="checkbox"] {
  width: 18px !important;
  max-width: 18px !important;
  height: 18px !important;
  max-height: 18px !important;
  min-width: 18px !important;
  min-height: 18px !important;
  margin: 2px 0 0 0 !important;
  padding: 0 !important;
  flex-shrink: 0 !important;
  accent-color: #16a34a !important;
  cursor: pointer !important;
  display: inline-block !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
.fpt-modal-content .checkbox-label span {
  flex: 1 !important;
  font-weight: 500 !important;
  color: #166534 !important;
}
.fpt-modal-content .checkbox-label a {
  color: #15803d !important;
  font-weight: 700 !important;
  text-decoration: underline !important;
}
.fpt-modal-content .checkbox-label a:hover {
  color: #047857 !important;
}
.form-note-text {
  font-size: 12px; color: #64748b; text-align: center; margin: 10px 0 14px 0; line-height: 1.4;
}
.w-100 { width: 100%; }

/* Success Modal Styles */
.text-center { text-align: center; }
.success-icon-wrap {
  width: 80px; height: 80px; margin: 0 auto 20px;
  position: relative; display: flex; justify-content: center; align-items: center;
}
.ripple {
  position: absolute; inset: 0; background: #22c55e; border-radius: 50%;
  animation: pulseRipple 2s infinite; opacity: 0;
}
.ripple.delay { animation-delay: 1s; }
@keyframes pulseRipple {
  0% { transform: scale(1); opacity: 0.4; }
  100% { transform: scale(1.6); opacity: 0; }
}
.success-icon-wrap svg { position: relative; z-index: 2; }
.summary-table {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
  overflow: hidden; margin: 24px 0; text-align: left;
}
.summary-header {
  background: #f1f5f9; padding: 12px 16px; font-size: 13px; font-weight: 700; color: #0f172a;
  border-bottom: 1px solid #e2e8f0;
}
.summary-row {
  display: flex; justify-content: space-between; padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0; font-size: 13px;
}
.summary-row:last-child { border-bottom: none; }
.summary-row span { color: #64748b; }
.summary-row strong { color: #0f172a; text-align: right; max-width: 60%; }
.support-text {
  font-size: 12px; color: #64748b; margin-top: 16px;
}
.support-text a { color: #0369a1; font-weight: 700; text-decoration: none; }
</style>

<!-- Registration Modal -->
<div class="fpt-modal-overlay" id="registerModal">
  <div class="fpt-modal-content">
    <button class="modal-close" onclick="closeRegisterModal()">&times;</button>
    <h3 class="modal-title" id="regModalTitle">Gói cước LUX 500</h3>
    <form id="popupForm" action="javascript:void(0);">
      <div class="form-group">
        <label>Họ và tên</label>
        <input type="text" name="Họ tên" placeholder="Ví dụ: Nguyễn Văn A" required>
      </div>
      <div class="form-group">
        <label>Số điện thoại</label>
        <input type="tel" name="Số điện thoại" placeholder="Ví dụ: 0987654321" pattern="[0-9]{10,11}" required>
      </div>
      <div class="form-group">
        <label>Địa chỉ lắp đặt</label>
        <input type="text" name="Khu vực" placeholder="Ví dụ: Số 10, Ngõ 12, Đường ABC..." required>
      </div>
      <div class="form-group">
        <label>Nhu cầu sử dụng của bạn</label>
        <textarea name="Ghi chú" rows="3" placeholder="Ví dụ: Chơi game, làm việc từ xa, gia đình 4 người..."></textarea>
      </div>
      <input type="hidden" name="Gói cước" id="regPackageName" value="">
      <input type="hidden" name="Thời gian liên hệ" value="Gọi ngay bây giờ">
      <input type="hidden" name="website" value="">
      
      <div class="form-group consent-group">
        <label class="checkbox-label">
          <input type="checkbox" name="consent_nd13" value="1" checked required>
          <span>🔒 <strong>Miễn phí khảo sát 100%.</strong> Tôi đồng ý cho FPT Telecom xử lý thông tin để tư vấn dịch vụ theo <a href="${policyHref}" target="_blank">Nghị định 13/2023/NĐ-CP</a>.</span>
        </label>
      </div>

      <div class="cf-turnstile" data-sitekey="0x4AAAAAAAEi6j9Y-0rZc7eU" data-size="flexible" data-theme="light" style="margin: 10px 0;"></div>

      <div class="form-note-text">💡 Giá cước có thể thay đổi theo từng khu vực</div>
      <button type="submit" class="btn btn-orange w-100" id="popupSubmitBtn">Xác nhận đăng ký</button>
    </form>
  </div>
</div>

<!-- Success Modal -->
<div class="fpt-modal-overlay" id="successModal">
  <div class="fpt-modal-content text-center">
    <div class="success-icon-wrap">
       <div class="ripple"></div>
       <div class="ripple delay"></div>
       <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
         <circle cx="12" cy="12" r="12" fill="#22c55e"></circle>
         <path d="M7 13l3 3 7-7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
       </svg>
    </div>
    <h3 style="margin-bottom:8px; color: #0f172a;">Đăng ký thành công!</h3>
    <p style="font-size:13px; color:#64748b; line-height:1.5;">Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi.<br>Chuyên viên tư vấn sẽ liên hệ với bạn trong vòng 15-30 phút tới.</p>
    
    <div class="summary-table">
      <div class="summary-header">Tóm tắt đăng ký</div>
      <div class="summary-row"><span>Họ và tên:</span><strong id="succName">Nguyễn Văn An</strong></div>
      <div class="summary-row"><span>Số điện thoại:</span><strong id="succPhone">0987654321</strong></div>
      <div class="summary-row"><span>Gói cước đã chọn:</span><strong id="succPackage">Gói Internet</strong></div>
    </div>
    
    <button class="btn btn-blue w-100" onclick="closeSuccessModal()">Quay lại trang chủ</button>
    <div class="support-text">Cần hỗ trợ ngay? Gọi <a href="tel:0383900321">0383 900 321</a></div>
  </div>
</div>
`;

document.body.insertAdjacentHTML("beforeend", modalsHTML);

window.openRegisterModal = function (packageName) {
  const modal = document.getElementById("registerModal");
  if (!modal) return;
  const title = document.getElementById("regModalTitle");
  if (title)
    title.textContent = packageName
      ? "Gói cước " + packageName
      : "Đăng ký dịch vụ FPT";
  const pkgInput = document.getElementById("regPackageName");
  if (pkgInput) pkgInput.value = packageName || "Khách hàng cần tư vấn";
  modal.classList.add("show");
};

window.closeRegisterModal = function () {
  const modal = document.getElementById("registerModal");
  if (modal) modal.classList.remove("show");
};

window.openSuccessModal = function (name, phone, pkg) {
  const modal = document.getElementById("successModal");
  if (!modal) return;
  const sName = document.getElementById("succName");
  if (sName) sName.textContent = name || "Khách hàng";
  const sPhone = document.getElementById("succPhone");
  if (sPhone) sPhone.textContent = phone || "---";
  const sPkg = document.getElementById("succPackage");
  if (sPkg) sPkg.textContent = pkg || "Chưa rõ";
  modal.classList.add("show");
};

window.closeSuccessModal = function () {
  const modal = document.getElementById("successModal");
  if (modal) modal.classList.remove("show");
};

// Auto prefill package from URL parameter (?goi=... or ?package=...)
(function checkUrlPackageParam() {
  const params = new URLSearchParams(window.location.search);
  const pkgParam =
    params.get("goi") || params.get("package") || params.get("plan");
  if (pkgParam) {
    const sel = document.querySelector('select[name="Gói cước"]');
    if (sel) {
      for (let opt of sel.options) {
        if (
          opt.text.toLowerCase().includes(pkgParam.toLowerCase()) ||
          pkgParam.toLowerCase().includes(opt.value.toLowerCase())
        ) {
          sel.value = opt.value;
          break;
        }
      }
    }
  }
})();

// Override link clicks for packages
document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;
  const href = link.getAttribute("href");

  if (
    href === "#contact" ||
    (href && href.includes("lien-he.html") && link.classList.contains("btn"))
  ) {
    const pkgEl =
      link.closest(".package") ||
      link.closest(".triple") ||
      link.closest(".fpt-card");
    let pkgName = "";
    if (pkgEl) {
      const h3 = pkgEl.querySelector("h3, .fpt-card-title");
      if (h3) pkgName = h3.textContent.trim();
    }

    // Prevent default navigation if on a page that supports the modal
    if (document.getElementById("registerModal")) {
      e.preventDefault();
      window.openRegisterModal(pkgName);
    }
  }
});

/* =========================================================
   DYNAMIC INTERACTION MODULES (2026 EDITION)
   ========================================================= */

// 1. Header Elevation on Scroll (Frosted Glass Effect)
const headerEl = document.querySelector(".header");
if (headerEl) {
  let headerTicking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!headerTicking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 38) {
            headerEl.classList.add("scrolled");
          } else {
            headerEl.classList.remove("scrolled");
          }
          headerTicking = false;
        });
        headerTicking = true;
      }
    },
    { passive: true },
  );
}

// 2. Interactive Spotlight Glow Effect on Cards (Desktop Fine Pointer)
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const spotlightCards = document.querySelectorAll(
    ".package, .feature-card, .news-card, .testimonial-grid figure",
  );
  spotlightCards.forEach((card) => {
    card.classList.add("spotlight-card");
    let cardTicking = false;

    card.addEventListener("mousemove", (e) => {
      if (!cardTicking) {
        window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
          cardTicking = false;
        });
        cardTicking = true;
      }
    });
  });
}

// 3. Smooth Number Counter Animation
const counterElements = document.querySelectorAll(".stat-counter");
if (counterElements.length > 0 && "IntersectionObserver" in window) {
  const formatNumber = (num, isLocale) => {
    if (isLocale) {
      return new Intl.NumberFormat("vi-VN").format(Math.round(num));
    }
    return Math.round(num).toString();
  };

  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute("data-target")) || 0;
    const isLocale = el.getAttribute("data-format") === "locale";
    const suffix = el.getAttribute("data-suffix") || "";
    const duration = 1600; // ms
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * easeOut;

      el.textContent = `${formatNumber(currentVal, isLocale)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent = `${formatNumber(target, isLocale)}${suffix}`;
      }
    };

    requestAnimationFrame(updateCount);
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  counterElements.forEach((el) => counterObserver.observe(el));
}

// 4. Material Click Ripple Effect on Interactive Elements
document.addEventListener("click", (e) => {
  const rippleTarget = e.target.closest(
    ".btn, .outline-btn, .tab, .read-more, .header-cta",
  );
  if (!rippleTarget) return;

  const rect = rippleTarget.getBoundingClientRect();
  const circle = document.createElement("span");
  const diameter = Math.max(rect.width, rect.height);
  const radius = diameter / 2;

  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${e.clientX - rect.left - radius}px`;
  circle.style.top = `${e.clientY - rect.top - radius}px`;
  circle.classList.add("ripple-wave");

  const existingRipple = rippleTarget.querySelector(".ripple-wave");
  if (existingRipple) {
    existingRipple.remove();
  }

  // Ensure button has relative position and hidden overflow
  const prevPosition = window.getComputedStyle(rippleTarget).position;
  if (prevPosition === "static") {
    rippleTarget.style.position = "relative";
  }
  rippleTarget.style.overflow = "hidden";

  rippleTarget.appendChild(circle);

  setTimeout(() => {
    circle.remove();
  }, 600);
});

