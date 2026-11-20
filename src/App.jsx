
import { useEffect, useState } from "react";
import {
  BsHouseFill,
  BsCheckSquareFill,
  BsCurrencyBitcoin,
  BsFilm,
  BsClipboard2Fill,
  BsRocketTakeoffFill,
  BsBookHalf,
} from "react-icons/bs";

import "./App.css";

// OMDb API 키를 발급받아 입력하세요.
const OMDB_KEY = "YOUR_OMDB_API_KEY";

const menus = [
  { id: "home", name: "Home", icon: BsHouseFill },
  { id: "todo", name: "Todo", icon: BsCheckSquareFill },
  { id: "coin", name: "Coin", icon: BsCurrencyBitcoin },
  { id: "movie", name: "Movie", icon: BsFilm },
  { id: "board", name: "Board", icon: BsClipboard2Fill },
  { id: "rocket", name: "Rocket", icon: BsRocketTakeoffFill },
  { id: "book", name: "Book", icon: BsBookHalf },
];

const projects = [
  {
    id: "todo",
    icon: BsCheckSquareFill,
    title: "투두리스트",
    description: "일정 관리와 할 일 목록 기록",
  },
  {
    id: "coin",
    icon: BsCurrencyBitcoin,
    title: "코인트래커",
    description: "실시간 가상화폐 시세 확인 및 정보 트래킹",
  },
  {
    id: "movie",
    icon: BsFilm,
    title: "무비검색앱",
    description: "영화 데이터베이스 API를 활용한 영화 검색",
  },
  {
    id: "board",
    icon: BsClipboard2Fill,
    title: "게시판",
    description: "기본적인 커뮤니티 게시판",
  },
  {
    id: "rocket",
    icon: BsRocketTakeoffFill,
    title: "로켓앱",
    description: "스페이스X 로켓 발사 상태 및 상세 정보 조회",
  },
  {
    id: "book",
    icon: BsBookHalf,
    title: "구글북스 검색앱",
    description: "구글 도서 데이터를 활용한 온라인 책 검색",
  },
];

const loadStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

function App() {
  const [page, setPage] = useState("home");
  const [dark, setDark] = useState(false);

  // =========================
  // TODO
  // =========================

  const [todos, setTodos] = useState(() =>
    loadStorage("myTodos", [])
  );

  const [todoInput, setTodoInput] = useState("");

  useEffect(() => {
    localStorage.setItem("myTodos", JSON.stringify(todos));
  }, [todos]);

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

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // =========================
  // COIN
  // =========================

  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinLoading, setCoinLoading] = useState(false);
  const [coinError, setCoinError] = useState("");

  useEffect(() => {
    if (page !== "coin") return;

    const controller = new AbortController();

    const fetchCoins = async () => {
      setCoinLoading(true);
      setCoinError("");

      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h",
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("코인 데이터를 불러오지 못했습니다.");
        }

        const data = await response.json();

        setCoins(data);

        setSelectedCoin((previous) =>
          data.find((coin) => coin.id === previous?.id) || data[0] || null
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          setCoinError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCoinLoading(false);
        }
      }
    };

    fetchCoins();

    return () => controller.abort();
  }, [page]);

  const formatPrice = (price) => {
    if (price == null) return "-";

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
  };

  const formatNumber = (number) => {
    if (number == null) return "-";

    return "$" + new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(number);
  };

  // =========================
  // MOVIE
  // =========================

  const [movieQuery, setMovieQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieLoading, setMovieLoading] = useState(false);
  const [movieError, setMovieError] = useState("");

  const searchMovies = async () => {
    if (!movieQuery.trim()) return;

    if (OMDB_KEY === "YOUR_OMDB_API_KEY") {
      setMovieError("App.jsx에 OMDb API 키를 입력해 주세요.");
      return;
    }

    setMovieLoading(true);
    setMovieError("");
    setSelectedMovie(null);

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_KEY}&s=${encodeURIComponent(movieQuery)}`
      );

      const data = await response.json();

      if (data.Response === "False") {
        throw new Error(data.Error);
      }

      setMovies(data.Search || []);
    } catch (error) {
      setMovies([]);
      setMovieError(error.message);
    } finally {
      setMovieLoading(false);
    }
  };

  const getMovieDetail = async (imdbID) => {
    setMovieLoading(true);
    setMovieError("");

    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${imdbID}&plot=full`
      );

      const data = await response.json();

      if (data.Response === "False") {
        throw new Error(data.Error);
      }

      setSelectedMovie(data);
    } catch (error) {
      setMovieError(error.message);
    } finally {
      setMovieLoading(false);
    }
  };

  // =========================
  // BOARD
  // =========================

  const [posts, setPosts] = useState(() =>
    loadStorage("myPosts", [])
  );

  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    localStorage.setItem("myPosts", JSON.stringify(posts));
  }, [posts]);

  const savePost = () => {
    if (!postTitle.trim() || !postContent.trim()) {
      alert("제목과 내용을 입력해 주세요.");
      return;
    }

    if (editingId !== null) {
      setPosts(posts.map((post) =>
        post.id === editingId
          ? {
            ...post,
            title: postTitle,
            content: postContent,
            updatedAt: new Date().toLocaleString(),
          }
          : post
      ));
    } else {
      setPosts([
        {
          id: Date.now(),
          title: postTitle,
          content: postContent,
          date: new Date().toLocaleString(),
        },
        ...posts,
      ]);
    }

    setPostTitle("");
    setPostContent("");
    setEditingId(null);
    setSelectedPost(null);
  };

  const editPost = (post) => {
    setPostTitle(post.title);
    setPostContent(post.content);
    setEditingId(post.id);
    setSelectedPost(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletePost = (id) => {
    if (!window.confirm("게시글을 삭제할까요?")) return;

    setPosts(posts.filter((post) => post.id !== id));

    if (selectedPost?.id === id) {
      setSelectedPost(null);
    }
  };

  // =========================
  // ROCKET
  // =========================

  const [rockets, setRockets] = useState([]);
  const [selectedRocket, setSelectedRocket] = useState(null);
  const [rocketLoading, setRocketLoading] = useState(false);
  const [rocketError, setRocketError] = useState("");

  const [latestLaunch, setLatestLaunch] = useState(null);

  useEffect(() => {
    if (page !== "rocket") return;

    const controller = new AbortController();

    const fetchRockets = async () => {
      setRocketLoading(true);
      setRocketError("");

      try {
        const [rocketResponse, launchResponse] = await Promise.all([
          fetch("https://api.spacexdata.com/v4/rockets", {
            signal: controller.signal,
          }),
          fetch("https://api.spacexdata.com/v4/launches/latest", {
            signal: controller.signal,
          }),
        ]);

        if (!rocketResponse.ok) {
          throw new Error("로켓 정보를 불러오지 못했습니다.");
        }

        const rocketData = await rocketResponse.json();
        const launchData = launchResponse.ok
          ? await launchResponse.json()
          : null;

        setRockets(rocketData);
        setSelectedRocket((previous) =>
          rocketData.find((rocket) => rocket.id === previous?.id)
          || rocketData[0]
          || null
        );
        setLatestLaunch(launchData);
      } catch (error) {
        if (error.name !== "AbortError") {
          setRocketError(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setRocketLoading(false);
        }
      }
    };

    fetchRockets();

    return () => controller.abort();
  }, [page]);

  // =========================
  // BOOK
  // =========================

  const [bookQuery, setBookQuery] = useState("");
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookLoading, setBookLoading] = useState(false);
  const [bookError, setBookError] = useState("");

  const searchBooks = async () => {
    if (!bookQuery.trim()) return;

    setBookLoading(true);
    setBookError("");
    setSelectedBook(null);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(bookQuery)}&maxResults=20&printType=books`
      );

      if (!response.ok) {
        throw new Error("도서 데이터를 불러오지 못했습니다.");
      }

      const data = await response.json();
      setBooks(data.items || []);

      if (!data.items?.length) {
        setBookError("검색 결과가 없습니다.");
      }
    } catch (error) {
      setBooks([]);
      setBookError(error.message);
    } finally {
      setBookLoading(false);
    }
  };

  // =========================
  // PAGE RENDER
  // =========================

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
            {projects.map((project) => {
              const Icon = project.icon;

              return (
                <div
                  className="project-card"
                  key={project.id}
                  onClick={() => setPage(project.id)}
                >
                  <div className="project-icon">
                    <Icon size={36} />
                  </div>

                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              );
            })}
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
              value={todoInput}
              placeholder="오늘의 할 일을 입력하세요"
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
                  className={`todo-check ${
                    todo.completed ? "completed" : ""
                  }`}
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
                      coin.price_change_percentage_24h >= 0
                        ? "up"
                        : "down"
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
                    <h2>{selectedCoin.market_cap_rank}위</h2>
                  </div>
                </div>
              </>
            ) : (
              <p className="coin-message">
                {coinLoading ? "불러오는 중..." : coinError || "코인을 선택해 주세요."}
              </p>
            )}
          </section>
        </main>
      );
    }

    // MOVIE
    if (page === "movie") {
      return (
        <main className="feature-container">
          <h2>Movie Search</h2>
          <p className="feature-subtitle">
            원하는 영화 제목을 검색해 보세요.
          </p>

          <div className="search-box">
            <input
              value={movieQuery}
              placeholder="영화 제목을 입력하세요."
              onChange={(e) => setMovieQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchMovies();
              }}
            />
            <button onClick={searchMovies}>검색</button>
          </div>

          {movieLoading && <p className="loading-text">불러오는 중...</p>}
          {movieError && <p className="error-text">{movieError}</p>}

          {selectedMovie ? (
            <section className="detail-panel">
              <button
                className="back-button"
                onClick={() => setSelectedMovie(null)}
              >
                ← 검색 결과로 돌아가기
              </button>

              <div className="movie-detail-layout">
                <img
                  src={selectedMovie.Poster !== "N/A"
                    ? selectedMovie.Poster
                    : "https://placehold.co/300x440?text=No+Poster"}
                  alt={selectedMovie.Title}
                />

                <div>
                  <h2>{selectedMovie.Title}</h2>
                  <p>개봉 연도: {selectedMovie.Year}</p>
                  <p>장르: {selectedMovie.Genre}</p>
                  <p>감독: {selectedMovie.Director}</p>
                  <p>배우: {selectedMovie.Actors}</p>
                  <p>평점: {selectedMovie.imdbRating}</p>
                  <p className="detail-plot">{selectedMovie.Plot}</p>
                </div>
              </div>
            </section>
          ) : (
            <section className="media-grid">
              {movies.map((movie) => (
                <div
                  className="media-card"
                  key={movie.imdbID}
                  onClick={() => getMovieDetail(movie.imdbID)}
                >
                  <img
                    src={movie.Poster !== "N/A"
                      ? movie.Poster
                      : "https://placehold.co/300x440?text=No+Poster"}
                    alt={movie.Title}
                  />
                  <h3>{movie.Title}</h3>
                  <p>{movie.Year}</p>
                </div>
              ))}
            </section>
          )}
        </main>
      );
    }

    // BOARD
    if (page === "board") {
      return (
        <main className="feature-container">
          <h2>Community Board</h2>
          <p className="feature-subtitle">
            자유롭게 글을 작성하고 관리할 수 있습니다.
          </p>

          <section className="board-form">
            <h3>{editingId !== null ? "게시글 수정" : "새 게시글 작성"}</h3>

            <input
              value={postTitle}
              placeholder="제목을 입력하세요."
              onChange={(e) => setPostTitle(e.target.value)}
            />

            <textarea
              value={postContent}
              placeholder="내용을 입력하세요."
              rows={5}
              onChange={(e) => setPostContent(e.target.value)}
            />

            <div className="board-actions">
              <button onClick={savePost}>
                {editingId !== null ? "수정 완료" : "게시글 등록"}
              </button>

              {editingId !== null && (
                <button
                  className="cancel-button"
                  onClick={() => {
                    setEditingId(null);
                    setPostTitle("");
                    setPostContent("");
                  }}
                >
                  취소
                </button>
              )}
            </div>
          </section>

          {selectedPost ? (
            <section className="detail-panel">
              <button
                className="back-button"
                onClick={() => setSelectedPost(null)}
              >
                ← 목록으로
              </button>

              <h2>{selectedPost.title}</h2>
              <small>{selectedPost.updatedAt || selectedPost.date}</small>
              <p className="post-detail-content">
                {selectedPost.content}
              </p>

              <div className="board-actions">
                <button onClick={() => editPost(selectedPost)}>
                  수정
                </button>
                <button
                  className="danger-button"
                  onClick={() => deletePost(selectedPost.id)}
                >
                  삭제
                </button>
              </div>
            </section>
          ) : (
            <section className="board-list">
              <h3>게시글 목록 ({posts.length})</h3>

              {posts.length === 0 && (
                <p className="empty-text">등록된 게시글이 없습니다.</p>
              )}

              {posts.map((post, index) => (
                <div className="board-item" key={post.id}>
                  <span>{index + 1}</span>

                  <div
                    className="board-item-content"
                    onClick={() => setSelectedPost(post)}
                  >
                    <strong>{post.title}</strong>
                    <small>{post.updatedAt || post.date}</small>
                  </div>

                  <button
                    className="delete-button"
                    onClick={() => deletePost(post.id)}
                  >
                    🗑
                  </button>
                </div>
              ))}
            </section>
          )}
        </main>
      );
    }

    // ROCKET
    if (page === "rocket") {
      return (
        <main className="feature-container">
          <h2>SpaceX Rocket</h2>
          <p className="feature-subtitle">
            SpaceX 로켓 정보와 최근 발사 정보를 확인하세요.
          </p>

          {rocketLoading && (
            <p className="loading-text">로켓 정보를 불러오는 중...</p>
          )}

          {rocketError && <p className="error-text">{rocketError}</p>}

          {latestLaunch && (
            <section className="launch-panel">
              <h3>최근 발사 정보</h3>
              <p><strong>{latestLaunch.name}</strong></p>
              <p>
                발사 날짜:{" "}
                {latestLaunch.date_utc
                  ? new Date(latestLaunch.date_utc).toLocaleString()
                  : "-"}
              </p>
              <p>
                발사 결과:{" "}
                {latestLaunch.success === null
                  ? "미확인"
                  : latestLaunch.success
                    ? "성공"
                    : "실패"}
              </p>
              {latestLaunch.links?.webcast && (
                <a
                  href={latestLaunch.links.webcast}
                  target="_blank"
                  rel="noreferrer"
                >
                  발사 영상 보기
                </a>
              )}
            </section>
          )}

          {selectedRocket && (
            <section className="detail-panel rocket-detail">
              <h2>{selectedRocket.name}</h2>

              <div className="rocket-image">
                {selectedRocket.flickr_images?.[0] && (
                  <img
                    src={selectedRocket.flickr_images[0]}
                    alt={selectedRocket.name}
                  />
                )}
              </div>

              <div className="rocket-specs">
                <div>
                  <span>높이</span>
                  <strong>{selectedRocket.height?.meters ?? "-"} m</strong>
                </div>
                <div>
                  <span>직경</span>
                  <strong>{selectedRocket.diameter?.meters ?? "-"} m</strong>
                </div>
                <div>
                  <span>질량</span>
                  <strong>
                    {selectedRocket.mass?.kg?.toLocaleString() ?? "-"} kg
                  </strong>
                </div>
                <div>
                  <span>성공률</span>
                  <strong>{selectedRocket.success_rate_pct ?? "-"}%</strong>
                </div>
              </div>

              <p>{selectedRocket.description}</p>

              <a
                href={selectedRocket.wikipedia}
                target="_blank"
                rel="noreferrer"
              >
                Wikipedia에서 자세히 보기
              </a>
            </section>
          )}

          <h3 className="section-heading">Rocket List</h3>

          <section className="rocket-grid">
            {rockets.map((rocket) => (
              <div
                className={`rocket-card ${
                  selectedRocket?.id === rocket.id ? "selected" : ""
                }`}
                key={rocket.id}
                onClick={() => setSelectedRocket(rocket)}
              >
                <BsRocketTakeoffFill size={32} />
                <h3>{rocket.name}</h3>
                <p>{rocket.country}</p>
                <small>
                  {rocket.active ? "운용 중" : "운용 종료"}
                </small>
              </div>
            ))}
          </section>
        </main>
      );
    }

    // BOOK
    if (page === "book") {
      return (
        <main className="feature-container">
          <h2>Google Books Search</h2>
          <p className="feature-subtitle">
            찾고 싶은 책의 제목이나 저자를 검색해 보세요.
          </p>

          <div className="search-box">
            <input
              value={bookQuery}
              placeholder="책 제목 또는 저자를 입력하세요."
              onChange={(e) => setBookQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchBooks();
              }}
            />
            <button onClick={searchBooks}>검색</button>
          </div>

          {bookLoading && (
            <p className="loading-text">도서 정보를 불러오는 중...</p>
          )}

          {bookError && <p className="error-text">{bookError}</p>}

          {selectedBook ? (
            <section className="detail-panel book-detail">
              <button
                className="back-button"
                onClick={() => setSelectedBook(null)}
              >
                ← 검색 결과로 돌아가기
              </button>

              <div className="book-detail-layout">
                <img
                  src={
                    selectedBook.imageLinks?.thumbnail ||
                    "https://placehold.co/300x440?text=No+Cover"
                  }
                  alt={selectedBook.title}
                />

                <div>
                  <h2>{selectedBook.title}</h2>
                  <p>저자: {selectedBook.authors?.join(", ") || "정보 없음"}</p>
                  <p>출판사: {selectedBook.publisher || "정보 없음"}</p>
                  <p>출판일: {selectedBook.publishedDate || "정보 없음"}</p>
                  <p>
                    페이지 수: {selectedBook.pageCount || "정보 없음"}
                  </p>
                  <p className="detail-plot">
                    {selectedBook.description || "상세 설명이 없습니다."}
                  </p>

                  {selectedBook.infoLink && (
                    <a
                      href={selectedBook.infoLink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Google Books에서 보기
                    </a>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <section className="media-grid book-grid">
              {books.map((book) => {
                const info = book.volumeInfo;

                return (
                  <div
                    className="media-card book-card"
                    key={book.id}
                    onClick={() => setSelectedBook(info)}
                  >
                    <img
                      src={
                        info.imageLinks?.thumbnail ||
                        "https://placehold.co/300x440?text=No+Cover"
                      }
                      alt={info.title}
                    />
                    <h3>{info.title}</h3>
                    <p>{info.authors?.join(", ") || "저자 정보 없음"}</p>
                  </div>
                );
              })}
            </section>
          )}
        </main>
      );
    }

    return null;
  };

  return (
    <div className={`app ${dark ? "dark" : ""}`}>

      <header className="navbar">
        <div
          className="logo"
          onClick={() => setPage("home")}
        >
          <BsRocketTakeoffFill color="#1976d2" />
          My Universe
        </div>

        <nav className="nav-menu">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <button
                key={menu.id}
                className={page === menu.id ? "nav-active" : ""}
                onClick={() => setPage(menu.id)}
              >
                <Icon size={15} />
                {menu.name}
              </button>
            );
          })}
        </nav>

        <button
          className="theme-button"
          onClick={() => setDark(!dark)}
        >
          {dark ? "☀ 라이트" : "🌙 다크"}
        </button>
      </header>

      {renderPage()}
    </div>
  );
}

export default App;

