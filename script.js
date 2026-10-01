// Thay URL của Google Apps Script bạn đã triển khai vào đây
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyIxTinaZczMdxbGsxuZyaS76JKC9pnPiLaSjwmQ2Weq5XMa-zBH0qPxanpbVbQjukx/exec';

// Hàm chuyển đổi giữa các Tab (Khảo sát / Thống kê)
// function switchTab(tabId, event) {
//     document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
//     document.querySelectorAll('.nav-tabs button').forEach(btn => btn.classList.remove('active'));
    
//     document.getElementById(tabId).classList.add('active');
//     event.currentTarget.classList.add('active');
// }

// Ví dụ hàm chuyển đổi qua lại giữa các tab
function switchTab(tabId) {
    // 1. Ẩn tất cả các tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // 2. Xóa active class của các nút menu (nếu có)
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 3. Hiển thị tab được chọn
    document.getElementById(tabId).style.display = 'block';
    event.currentTarget.classList.add('active');

    // 4. TỰ ĐỘNG LOAD DỮ LIỆU NẾU LÀ TAB THỐNG KÊ
    if (tabId === 'statsTab') {
        loadStats();
    }
}

// Xử lý logic ẩn/hiện bảng khảo sát 
function checkConsent() {
    // Lấy giá trị của nút radio đang được chọn
    const consentInput = document.querySelector('input[name="dongY"]:checked');
    const surveyContent = document.getElementById('surveyContent');

    if (consentInput) {
        if (consentInput.value === 'Yes') {
            // Nếu chọn Có -> Hiển thị câu hỏi
            surveyContent.style.display = 'block';
        } else if (consentInput.value === 'No') {
            // Nếu chọn Không -> Ẩn câu hỏi và thông báo
            surveyContent.style.display = 'none';
            alert('Cảm ơn bạn. Bạn có thể đóng trang này.');
        }
    }
}

// XỬ LÝ KHI BẤM NÚT GỬI KHẢO SÁT
document.getElementById('surveyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('submitStatus').style.display = 'inline';
    
    const formData = new FormData(this);
    const dataObj = Object.fromEntries(formData.entries());

    // --- BƯỚC 1: XÁC ĐỊNH TRỌNG SỐ ---
    const w1 = 0.4; // Tính cách (DISC)
    const w2 = 0.3; // Hứng thú (Mức độ yêu thích môn học)
    const w3 = 0.3; // Năng lực (Điểm trung bình môn)

    // --- BƯỚC 2: CHUẨN HÓA CÁC ĐIỂM THÀNH PHẦN VỀ THANG 0 - 1 ---
    
    // 2.1. Tính và chuẩn hóa điểm DISC (thang gốc 1-5)
    const dScore = (Number(dataObj.q14) + Number(dataObj.q15) + Number(dataObj.q16)) / 3;
    const iScore = (Number(dataObj.q17) + Number(dataObj.q18) + Number(dataObj.q19)) / 3;
    const sScore = (Number(dataObj.q20) + Number(dataObj.q21) + Number(dataObj.q22)) / 3;
    const cScore = (Number(dataObj.q23) + Number(dataObj.q24) + Number(dataObj.q25)) / 3;

    const normDISC_D = (dScore - 1) / 4; 
    const normDISC_I = (iScore - 1) / 4;
    const normDISC_S = (sScore - 1) / 4;
    const normDISC_C = (cScore - 1) / 4;

    // 2.2. Chuẩn hóa điểm hứng thú môn học (b3_mucDo)
    let normInterest = 0;
    switch (dataObj.b3_mucDo) {
        case 'BinhThuong': normInterest = 0.25; break;
        case 'Thich':      normInterest = 0.50; break;
        case 'RatThich':   normInterest = 0.75; break;
        case 'DamMe':      normInterest = 1.00; break;
        default:           normInterest = 0.00;
    }

    // 2.3. Chuẩn hóa điểm năng lực (b3_diem10)
    let parsedDiem10 = parseFloat(String(dataObj.b3_diem10).replace(',', '.'));
    if (isNaN(parsedDiem10)) parsedDiem10 = 0; 
    const normAbility = parsedDiem10 / 10;

    // --- BƯỚC 3: ÁP DỤNG CÔNG THỨC TÍNH ĐIỂM PHÙ HỢP ---
    const matchD = ((w1 * normDISC_D) + (w2 * normInterest) + (w3 * normAbility)) * 100;
    const matchI = ((w1 * normDISC_I) + (w2 * normInterest) + (w3 * normAbility)) * 100;
    const matchS = ((w1 * normDISC_S) + (w2 * normInterest) + (w3 * normAbility)) * 100;
    const matchC = ((w1 * normDISC_C) + (w2 * normInterest) + (w3 * normAbility)) * 100;

    // --- BƯỚC 4: GỬI DỮ LIỆU VÀ HIỂN THỊ KẾT QUẢ ---
    fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(dataObj)
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('submitStatus').style.display = 'none';
        document.getElementById('surveyForm').style.display = 'none';
        document.getElementById('resultContainer').style.display = 'block';
        
        // Mảng chứa thông tin chi tiết của 4 nhóm DISC
        const results = [
            { 
                id: 'D', name: 'Nhóm Quyền lực & Dẫn dắt', score: matchD, icon: '🔥', 
                careers: 'Quản lý, Khởi nghiệp - Kinh doanh, Luật sư, Sĩ quan', 
                desc: 'Bạn sinh ra để làm Leader! Bạn quyết đoán, thích chinh phục các mục tiêu lớn, dám nghĩ dám làm và không bao giờ ngại khó khăn.' 
            },
            { 
                id: 'I', name: 'Nhóm Truyền cảm hứng & Kết nối', score: matchI, icon: '🌟', 
                careers: 'Truyền thông, Sự kiện, Báo chí, Giáo viên, Du lịch', 
                desc: 'Bạn tỏa sáng trước đám đông! Điểm mạnh của bạn là giao tiếp xuất sắc, sự hòa đồng và khả năng truyền năng lượng tích cực cho mọi người.' 
            },
            { 
                id: 'S', name: 'Nhóm Tận tâm & Hỗ trợ', score: matchS, icon: '💖', 
                careers: 'Y tế, Tâm lý học, Công tác xã hội, Nhân sự', 
                desc: 'Bạn là mảnh ghép không thể thiếu của mọi đội nhóm! Sự kiên nhẫn, biết lắng nghe và đáng tin cậy của bạn mang lại sự an tâm tuyệt đối cho người khác.' 
            },
            { 
                id: 'C', name: 'Nhóm Phân tích & Chuyên gia', score: matchC, icon: '🧠', 
                careers: 'CNTT, Kế toán - Kiểm toán, Kỹ thuật, Nghiên cứu khoa học', 
                desc: 'Bạn là bộ não logic sắc bén! Bạn làm việc cẩn thận, chú ý đến từng chi tiết nhỏ và luôn tạo ra những kết quả chuẩn xác, hoàn hảo nhất.' 
            }
        ];

        // Sắp xếp mảng từ điểm cao xuống thấp
        results.sort((a, b) => b.score - a.score);

        // Hàm đánh giá mức độ dựa trên %
        const getLevel = (score) => {
            if (score >= 75) return { text: '🌟 Rất tiềm năng', color: '#27ae60', bg: '#e8f8f5' };
            if (score >= 50) return { text: '💡 Đáng cân nhắc', color: '#f39c12', bg: '#fef5e7' };
            return { text: '🔍 Khám phá thêm', color: '#7f8c8d', bg: '#f2f4f4' };
        };

        // Render HTML động
        let resultHTML = '<div class="result-cards">';
        results.forEach((item, index) => {
            const level = getLevel(item.score);
            const isTop = index === 0; // Đánh dấu thẻ đứng Top 1
            
            resultHTML += `
                <div class="career-card ${isTop ? 'top-match' : ''}">
                    <div class="card-header">
                        <h3>${item.icon} ${item.name}</h3>
                        <span class="score-badge" style="color: ${level.color}; background: ${level.bg};">
                            ${level.text} (${item.score.toFixed(1)}%)
                        </span>
                    </div>
                    <div class="card-body">
                        <p><span class="highlight-text">Tố chất của bạn:</span> ${item.desc}</p>
                        <p><strong>Nghề nghiệp tiêu biểu:</strong> ${item.careers}</p>
                    </div>
                </div>
            `;
        });
        resultHTML += '</div>';

        document.getElementById('careerSuggestions').innerHTML = resultHTML;
    })
    .catch(error => {
        alert('Đã xảy ra lỗi khi gửi dữ liệu. Vui lòng thử lại.');
        document.getElementById('submitStatus').style.display = 'none';
        console.error(error);
    });
});

// Hàm lấy dữ liệu thống kê từ Google Sheet
function loadStats() {
    document.getElementById('loadStatus').style.display = 'inline';
    
    // Gọi API lấy dữ liệu qua Phương thức GET
    fetch(APPS_SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
        document.getElementById('loadStatus').style.display = 'none';
        document.getElementById('statsContainer').style.display = 'block';
        
        // Hiển thị tổng số khảo sát
        document.getElementById('totalCount').innerText = data.total;
        
        // Tìm số điểm lớn nhất để vẽ độ dài cho biểu đồ thanh (bar)
        const maxScore = Math.max(data.D, data.I, data.S, data.C) || 1;
        
        const updateBar = (id, score) => {
            const el = document.getElementById(id);
            // Thêm .toFixed(1) để làm tròn số chỉ lấy 1 chữ số thập phân
            el.innerText = score.toFixed(1); 
            // Đặt chiều rộng tối thiểu là 5% để text không bị tràn ra ngoài
            el.style.width = Math.max((score / maxScore) * 100, 5) + '%';
        };
        
        updateBar('barD', data.D);
        updateBar('barI', data.I);
        updateBar('barS', data.S);
        updateBar('barC', data.C);
    })
    .catch(error => {
        alert('Không thể tải dữ liệu thống kê từ máy chủ.');
        document.getElementById('loadStatus').style.display = 'none';
        console.error(error);
    });
}

// Thay đổi ngôn ngữ cảnh báo mặc định của trình duyệt sang tiếng Việt
document.addEventListener("DOMContentLoaded", function() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        // Bắt sự kiện khi dữ liệu không hợp lệ (bị bỏ trống)
        input.addEventListener('invalid', function(e) {
            e.target.setCustomValidity('');
            if (!e.target.validity.valid) {
                if (e.target.type === 'radio' || e.target.tagName === 'SELECT') {
                    e.target.setCustomValidity('Vui lòng chọn một tùy chọn để tiếp tục.');
                } else {
                    e.target.setCustomValidity('Vui lòng điền thông tin vào phần này.');
                }
            }
        });        

        // Xóa cảnh báo ngay khi người dùng bắt đầu nhập hoặc chọn lại
        input.addEventListener('input', function(e) {
            e.target.setCustomValidity('');
        });
        
        input.addEventListener('change', function(e) {
            e.target.setCustomValidity('');
        });
    });
});


// Hệ thống Validate Real-time (Ngay khi nhập) cho các ô Text
document.addEventListener("DOMContentLoaded", function() {
    const textInputs = document.querySelectorAll('input[type="text"]');
    
    textInputs.forEach(input => {
        // Kiểm tra mỗi khi gõ phím
        input.addEventListener('input', function() {
            validateRealTime(this);
        });
        
        // Hiện thông báo lỗi nếu click ra ngoài mà vẫn sai
        input.addEventListener('blur', function() {
            validateRealTime(this);
            if (!this.validity.valid) {
                this.reportValidity();
            }
        });
    });

    function validateRealTime(input) {
        const val = input.value.trim().toLowerCase();
        const name = input.name;

        // Xoá trạng thái cũ
        input.setCustomValidity('');
        input.classList.remove('is-valid', 'is-invalid');

        // Bỏ trống ô bắt buộc
        if (val === '' && input.required) {
            input.setCustomValidity('Vui lòng điền thông tin vào phần này.');
            input.classList.add('is-invalid');
            return;
        }

        // Logic riêng cho các ô nhập điểm (b3_diem10, b6_gpa10)
        if (name === 'b3_diem10' || name === 'b6_gpa10') {
            // Chấp nhận chữ "không áp dụng" hoặc "khong ap dung"
            if (val !== '' && val !== 'không áp dụng' && val !== 'khong ap dung') {
                // Đổi dấu phẩy thành dấu chấm để kiểm tra số (VD: 8,5 -> 8.5)
                let num = parseFloat(val.replace(',', '.'));
                
                // Báo lỗi nếu không phải là số, hoặc số nằm ngoài khoảng 0-10
                if (isNaN(num) || num < 0 || num > 10) {
                    input.setCustomValidity('Vui lòng nhập điểm hợp lệ (từ 0 đến 10) hoặc ghi "không áp dụng".');
                    input.classList.add('is-invalid');
                    return;
                }
            }
        }

        // Nếu có dữ liệu hợp lệ (hoặc ô không bắt buộc mà đang gõ)
        if (val !== '') {
            input.classList.add('is-valid');
        }
    }
});

// --- ĐIỀU KHIỂN SLIDE VÀ CHẾ ĐỘ TOÀN MÀN HÌNH (TAB 3) ---
let currentSlideIndex = 0;

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide-item-img');
    const counter = document.getElementById('slideCounter');
    
    if (!slides.length) return;
    
    // Ẩn slide hiện tại
    slides[currentSlideIndex].style.display = 'none';
    
    // Tính toán index mới
    currentSlideIndex += direction;
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }
    
    // Hiển thị slide mới
    slides[currentSlideIndex].style.display = 'block';
    if (counter) {
        counter.innerText = `Slide ${currentSlideIndex + 1} / ${slides.length}`;
    }
}

// Hàm bật/tắt chế độ Trình chiếu toàn màn hình
function toggleFullScreen() {
    const wrapper = document.getElementById('slideWrapper');
    
    if (!document.fullscreenElement) {
        // Yêu cầu phóng to toàn màn hình khung chứa slide
        if (wrapper.requestFullscreen) {
            wrapper.requestFullscreen();
        } else if (wrapper.webkitRequestFullscreen) { /* Safari */
            wrapper.webkitRequestFullscreen();
        } else if (wrapper.msRequestFullscreen) { /* IE/Edge */
            wrapper.msRequestFullscreen();
        }
    } else {
        // Thoát toàn màn hình
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}