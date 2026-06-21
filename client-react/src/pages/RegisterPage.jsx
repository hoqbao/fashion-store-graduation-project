import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";

function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fullName.trim()) {
      setError("Vui lòng nhập họ tên.");
      return;
    }

    if (!email.trim()) {
      setError("Vui lòng nhập email.");
      return;
    }

    if (!phone.trim()) {
      setError("Vui lòng nhập số điện thoại.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      await axiosClient.post("/auth/register", {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      setSuccessMessage("Đăng ký tài khoản thành công. Đang chuyển đến trang đăng nhập...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Không thể đăng ký tài khoản. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Header />

      <main className="py-5">
        <div className="container">
          <div
            className="card border-0 shadow-sm mx-auto"
            style={{ maxWidth: "560px" }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <p className="text-uppercase text-secondary fw-semibold mb-1">
                  Tài khoản
                </p>

                <h1 className="h3 fw-bold mb-0">
                  Đăng ký tài khoản
                </h1>
              </div>

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="alert alert-success">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    Họ và tên
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Nhập họ và tên"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Email
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Nhập email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Số điện thoại
                  </label>

                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Nhập số điện thoại"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Mật khẩu
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Nhập mật khẩu"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Xác nhận mật khẩu
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100"
                  disabled={submitting}
                >
                  {submitting ? "Đang đăng ký..." : "Đăng ký"}
                </button>
              </form>

              <p className="text-center text-secondary mt-4 mb-0">
                Đã có tài khoản?{" "}
                <Link to="/login" className="fw-semibold text-dark">
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default RegisterPage;
