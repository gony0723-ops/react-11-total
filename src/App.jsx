
import { useEffect, useState } from "react";
import "./App.css";

const menus = [
  { id: "home", name: "Home", icon: "⌂" },
  { id: "todo", name: "Todo", icon: "☑" },
  { id: "coin", name: "Coin", icon: "₿" },
  { id: "movie", name: "Movie", icon: "🎞 " },
  { id: "board", name: "Board", icon: "📋" },
  { id: "rocket", name: "Rocket", icon: "🚀" },
  { id: "book", name: "Book", icon: "📘" },
];

const projects = [
  {
    id: "todo",
    icon: "☑",
    title: "투두리스트",
    description: "일정 관리와 할 일 목록 기록",
  },
  {
    id: "coin",
    icon: "₿",
    title: "코인트래커",
    description: "가상화폐 시세 확인 및 정보 트래킹",
  },
  {
    id: "movie",
    icon: "🎞",
    title: "무비검색앱",
    description: "영화 데이터베이스 API를 활용한 영화 검색",
  },
  {
    id: "board",
    icon: "📋",
    title: "게시판",
    description: "기본적인 커뮤니티 게시판",
  },
  {
    id: "rocket",
    icon: "🚀",
    title: "로켓앱",
    description: "스페이스X의 로켓 발사 상태 및 상세 정보 조회",
  },
  {
    id: "book",
    icon: "📘",
    title: "구글북스 검색앱",
    description: "구글 도서 데이터를 활용한 온라인 책 검색",
  },
];

function App() {
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(false);

  // Todo 데이터
  const [todos, setTodos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("myTodos")) || [];
    } catch {
      return [];
    }
  });

  const [todoInput, setTodoInput] = useState("");

  // Coin 데이터
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinLoading, setCoinLoading] = useState(false);
  const [coinError, setCoinError] = useState("");

  // Todo 자동 저장
  useEffect(() => {
    localStorage.setItem("myTodos", JSON.stringify(todos));
  }, [todos]);

  // Coin API 데이터 가져오기
  useEffect(() => {
    if (page !== "coin") return;

    const fetchCoins = async () => {
      setCoinLoading(true);
      setCoinError("");

      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h",
        );

        if (!response.ok) {
          throw new Error("코인 데이터를 불러오지 못했습니다.");
        }

        const data = await response.json();

        setCoins(data);
        setSelectedCoin((previous) => {
          if (!data.length) return null;
          return data.find((coin) => coin.id === previous?.id) || data[0];
        });
      } catch (error) {
        setCoinError(error.message);
      } finally {
        setCoinLoading(false);
      }
    };

    fetchCoins();
  }, [page]);

  // Todo 추가
  const addTodo = () => {
    if (!todoInput.trim()) return;

    setTodos([
      ...todos,
      {
        id: Date.now(),
        text: todoInput.trim(),
        completed: false,
      },
    ]);

    setTodoInput("");
  };

  // Todo 완료 체크
  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  // Todo 삭제
  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // 가격 표시
  const formatPrice = (price) => {
    if (price == null) return "-";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  // 큰 숫자 축약 표시
  const formatNumber = (number) => {
    if (number == null) return "-";

    return (
      "$" +
      new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 2,
      }).format(number)
    );
  };

  // 페이지 화면 출력
  const renderPage = () => {
    // HOME
    if (page === "home") {
      return (
        <main className="home-container">
          <section className="welcome-box">
            <h1>My Project Dashboard</h1>
            <p>지금까지 구축한 포트폴리오 리스트입니다.</p>
          </section>

          <section className="project-grid">
            {projects.map((project) => (
              <div
                className="project-card"
                key={project.id}
                onClick={() => setPage(project.id)}
              >
                <div className="project-icon">{project.icon}</div>

                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
            ))}
          </section>
        </main>
      );
    }

    // TODO
    if (page === "todo") {
      return (
        <main className="todo-container">
          <h2>Todo List</h2>

          <div className="todo-input-box">
            <input
              type="text"
              placeholder="오늘의 할 일을 입력하세요"
              value={todoInput}
              onChange={(e) => setTodoInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addTodo();
              }}
            />

            <button onClick={addTodo}>+</button>
          </div>

          <div className="todo-list">
            {todos.map((todo) => (
              <div className="todo-item" key={todo.id}>
                <span
                  className={`todo-check ${todo.completed ? "completed" : ""}`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  ✓
                </span>

                <span
                  className={`todo-text ${
                    todo.completed ? "line-through" : ""
                  }`}
                  onClick={() => toggleTodo(todo.id)}
                >
                  {todo.text}
                </span>

                <button
                  className="delete-button"
                  onClick={() => deleteTodo(todo.id)}
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        </main>
      );
    }

    // COIN
    if (page === "coin") {
      return (
        <main className="coin-container">
          <aside className="coin-sidebar">
            <h3>₿ Top 50 Coins</h3>

            {coinLoading && <p className="coin-message">불러오는 중...</p>}

            {coinError && <p className="coin-message">{coinError}</p>}

            {coins.map((coin) => (
              <div
                key={coin.id}
                className={`coin-list-item ${
                  selectedCoin?.id === coin.id ? "active" : ""
                }`}
                onClick={() => setSelectedCoin(coin)}
              >
                <div className="coin-name">
                  <img src={coin.image} alt={coin.name} />
                  <div>
                    <strong>{coin.name}</strong>
                    <small>{coin.symbol.toUpperCase()}</small>
                  </div>
                </div>

                <div className="coin-price">
                  <strong>{formatPrice(coin.current_price)}</strong>

                  <small
                    className={
                      coin.price_change_percentage_24h >= 0 ? "up" : "down"
                    }
                  >
                    {coin.price_change_percentage_24h == null
                      ? "-"
                      : `${coin.price_change_percentage_24h.toFixed(2)}%`}
                  </small>
                </div>
              </div>
            ))}
          </aside>

          <section className="coin-detail">
            {selectedCoin ? (
              <>
                <div className="coin-title">
                  <img src={selectedCoin.image} alt="" />
                  <h1>{selectedCoin.name}</h1>
                  <span>{selectedCoin.symbol.toUpperCase()}</span>
                </div>

                <div className="coin-info-grid">
                  <div className="coin-info">
                    <p>현재 가격 (USD)</p>
                    <h2>{formatPrice(selectedCoin.current_price)}</h2>
                  </div>

                  <div className="coin-info">
                    <p>시가총액</p>
                    <h2>{formatNumber(selectedCoin.market_cap)}</h2>
                  </div>

                  <div className="coin-info">
                    <p>24시간 거래량</p>
                    <h2>{formatNumber(selectedCoin.total_volume)}</h2>
                  </div>

                  <div className="coin-info">
                    <p>시가총액 순위</p>
                    <h2>
                      {selectedCoin.market_cap_rank
                        ? `${selectedCoin.market_cap_rank}위`
                        : "-"}
                    </h2>
                  </div>
                </div>

                <div className="coin-extra">
                  <p>24시간 최고가 : {formatPrice(selectedCoin.high_24h)}</p>
                  <p>24시간 최저가 : {formatPrice(selectedCoin.low_24h)}</p>
                </div>
              </>
            ) : (
              <p className="coin-message">
                {coinLoading
                  ? "코인 정보를 불러오는 중입니다."
                  : "코인을 선택해 주세요."}
              </p>
            )}
          </section>
        </main>
      );
    }

    return null;
  };

  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      {/* 상단 메뉴 */}
      <header className="navbar">
        <div className="logo" onClick={() => setPage("home")}>
          🚀 My Universe
        </div>

        <nav className="nav-menu">
          {menus.map((menu) => (
            <button
              key={menu.id}
              className={page === menu.id ? "nav-active" : ""}
              onClick={() => setPage(menu.id)}
            >
              <span>{menu.icon}</span>
              {menu.name}
            </button>
          ))}
        </nav>

        <button className="theme-button" onClick={() => setDark(!dark)}>
          {dark ? "☀ 라이트" : "🌙 다크"}
        </button>
      </header>

      {/* 선택한 페이지 */}
      {renderPage()}
    </div>
  );
}

export default App;

