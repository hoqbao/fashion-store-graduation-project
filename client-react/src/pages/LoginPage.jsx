import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            const response = await axiosClient.post("/auth/login", {
                email,
                password
            });

            const { token, user } = response.data.data;

            localStorage.setItem("accessToken", token);
            localStorage.setItem("currentUser", JSON.stringify(user));

            navigate("/");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Đăng nhập thất bại. Vui lòng thử lại."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 bg-light d-flex align-items-center">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-5">
                        <div className="card border-0 shadow-sm">
                            <div className="card-body p-4 p-md-5">
                                <Link
                                    to="/"
                                    className="text-dark text-decoration-none fw-bold fs-4"
                                >
                                    FASHION STORE
                                </Link>

                                <h1 className="h3 fw-bold mt-4 mb-2">
                                    Đăng nhập
                                </h1>

                                <p className="text-secondary mb-4">
                                    Đăng nhập để thêm sản phẩm vào giỏ hàng và đặt hàng.
                                </p>

                                {error && (
                                    <div className="alert alert-danger">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="Nhập email"
                                            value={email}
                                            onChange={(event) =>
                                                setEmail(event.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">
                                            Mật khẩu
                                        </label>

                                        <input
                                            type="password"
                                            className="form-control"
                                            placeholder="Nhập mật khẩu"
                                            value={password}
                                            onChange={(event) =>
                                                setPassword(event.target.value)
                                            }
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-dark w-100"
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Đang đăng nhập..."
                                            : "Đăng nhập"}
                                    </button>
                                </form>

                                <p className="text-secondary text-center mt-4 mb-0">
                                    Chưa có tài khoản?{" "}
                                    <span className="text-dark fw-semibold">
                                        Đăng ký sẽ làm ở bước tiếp theo
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;