/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

// --- 타입 정의 ---
// 게시물 데이터의 형태를 정의합니다.
interface Post {
  id: number;
  title: string;
  content: string;
  // createdAt, updatedAt 등 다른 필드가 있다면 추가할 수 있습니다.
}

// 새 게시물 생성 시 필요한 데이터 타입
type CreatePostDto = {
  title: string;
  content: string;
};

// 게시물 수정 시 필요한 데이터 타입 (부분적 수정 가능)
type UpdatePostDto = {
  title?: string;
  content?: string;
};

// --- API 기본 URL ---
// 백엔드 서버의 주소입니다. 
const API_BASE_URL = 'http://localhost:3000/post';

// --- 메인 컴포넌트 ---
const PostTestPage: React.FC = () => {
  // --- 상태(State) 관리 ---
  // 여러 게시물을 담을 배열
  const [posts, setPosts] = useState<Post[]>([]);
  // API 응답 메시지
  const [message, setMessage] = useState<string>('여기에 API 응답 메시지가 표시됩니다.');
  // 로딩 상태
  const [loading, setLoading] = useState<boolean>(false);

  // 각 기능별 입력 데이터를 위한 상태
  const [createData, setCreateData] = useState<CreatePostDto>({ title: '', content: '' });
  const [updateData, setUpdateData] = useState({ id: '', title: '', content: '' });
  const [findId, setFindId] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // --- API 호출 함수 ---

  // 1. 모든 게시물 조회 (GET /post)
  const handleFindAll = async () => {
    setLoading(true);
    setMessage('모든 게시물을 조회 중입니다...');
    try {
      const response = await fetch(API_BASE_URL);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '데이터를 불러오는 데 실패했습니다.');

      setPosts(result.data);
      setMessage(result.message);
    } catch (error: any) {
      setMessage(`오류: ${error.message}`);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. ID로 특정 게시물 조회 (GET /post/:id)
  const handleFindOne = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findId) {
      setMessage('조회할 게시물의 ID를 입력하세요.');
      return;
    }
    setLoading(true);
    setMessage(`${findId}번 게시물을 조회 중입니다...`);
    try {
      const response = await fetch(`${API_BASE_URL}/${findId}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '데이터를 불러오는 데 실패했습니다.');

      setPosts([result.data]); // 결과 배열에 하나만 담아서 표시
      setMessage(result.message);
    } catch (error: any) {
      setMessage(`오류: ${error.message}`);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 3. 제목으로 게시물 검색 (GET /post/search?target=...)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) {
      setMessage('검색할 제목을 입력하세요.');
      return;
    }
    setLoading(true);
    setMessage(`'${searchTerm}' 제목으로 검색 중입니다...`);
    try {
      const response = await fetch(`${API_BASE_URL}/search?target=${encodeURIComponent(searchTerm)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '검색에 실패했습니다.');

      setPosts(result.data);
      setMessage(result.message);
    } catch (error: any) {
      setMessage(`오류: ${error.message}`);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 4. 새 게시물 생성 (POST /post)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.title || !createData.content) {
      setMessage('제목과 내용을 모두 입력하세요.');
      return;
    }
    setLoading(true);
    setMessage('게시물을 생성 중입니다...');
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '생성에 실패했습니다.');
      
      setMessage(result.message);
      setCreateData({ title: '', content: '' }); // 입력 필드 초기화
      await handleFindAll(); // 목록 새로고침
    } catch (error: any) {
      setMessage(`오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 5. 게시물 수정 (PATCH /post/:id)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateData.id) {
      setMessage('수정할 게시물의 ID를 입력하세요.');
      return;
    }
    setLoading(true);
    setMessage(`${updateData.id}번 게시물을 수정 중입니다...`);
    
    // 빈 값은 보내지 않도록 필터링
    const body: UpdatePostDto = {};
    if (updateData.title) body.title = updateData.title;
    if (updateData.content) body.content = updateData.content;

    try {
      const response = await fetch(`${API_BASE_URL}/${updateData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '수정에 실패했습니다.');

      setMessage(result.message);
      setUpdateData({ id: '', title: '', content: '' });
      await handleFindAll(); // 목록 새로고침
    } catch (error: any) {
      setMessage(`오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 6. 게시물 삭제 (DELETE /post/:id)
  const handleRemove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId) {
        setMessage('삭제할 게시물의 ID를 입력하세요.');
        return;
    }
    setLoading(true);
    setMessage(`${deleteId}번 게시물을 삭제 중입니다...`);
    try {
      const response = await fetch(`${API_BASE_URL}/${deleteId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '삭제에 실패했습니다.');

      setMessage(result.message);
      setDeleteId('');
      await handleFindAll(); // 목록 새로고침
    } catch (error: any) {
      setMessage(`오류: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- JSX 렌더링 ---
  return (
    <div style={styles.container}>
      <h1 style={styles.header}>📋 NestJS Post API 테스터</h1>
      
      {/* --- 결과 표시 영역 --- */}
      <div style={styles.messageBar}>
        <strong>상태:</strong> {loading ? '로딩 중...' : message}
      </div>
      <div style={styles.resultsContainer}>
        <h2 style={styles.subHeader}>게시물 목록</h2>
        {posts.length > 0 ? (
          <ul style={styles.postList}>
            {posts.map((post) => (
              <li key={post.id} style={styles.postItem}>
                <strong style={styles.postId}>ID: {post.id}</strong>
                <h3 style={styles.postTitle}>{post.title}</h3>
                <p style={styles.postContent}>{post.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>표시할 게시물이 없습니다. '모든 게시물 조회'를 실행해 보세요.</p>
        )}
      </div>

      {/* --- 기능 테스트 영역 --- */}
      <div style={styles.grid}>
        {/* 전체 조회 */}
        <div style={styles.card}>
            <h2 style={styles.subHeader}>1. 모든 게시물 조회</h2>
            <button onClick={handleFindAll} disabled={loading} style={styles.button}>
              모든 게시물 가져오기 (GET /post)
            </button>
        </div>

        {/* ID로 검색 */}
        <div style={styles.card}>
            <h2 style={styles.subHeader}>2. ID로 게시물 조회</h2>
            <form onSubmit={handleFindOne}>
              <input
                type="number"
                value={findId}
                onChange={(e) => setFindId(e.target.value)}
                placeholder="게시물 ID"
                style={styles.input}
              />
              <button type="submit" disabled={loading} style={styles.button}>
                ID로 조회 (GET /post/:id)
              </button>
            </form>
        </div>

        {/* 제목으로 검색 */}
        <div style={styles.card}>
            <h2 style={styles.subHeader}>3. 제목으로 검색</h2>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="검색할 제목"
                style={styles.input}
              />
              <button type="submit" disabled={loading} style={styles.button}>
                제목으로 검색 (GET /post/search)
              </button>
            </form>
        </div>
        
        {/* 생성 */}
        <div style={styles.card}>
          <h2 style={styles.subHeader}>4. 새 게시물 생성</h2>
          <form onSubmit={handleCreate}>
            <input
              type="text"
              value={createData.title}
              onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
              placeholder="제목"
              style={styles.input}
            />
            <textarea
              value={createData.content}
              onChange={(e) => setCreateData({ ...createData, content: e.target.value })}
              placeholder="내용"
              style={styles.textarea}
            />
            <button type="submit" disabled={loading} style={styles.button}>
              생성하기 (POST /post)
            </button>
          </form>
        </div>

        {/* 수정 */}
        <div style={styles.card}>
          <h2 style={styles.subHeader}>5. 게시물 수정</h2>
          <form onSubmit={handleUpdate}>
            <input
              type="number"
              value={updateData.id}
              onChange={(e) => setUpdateData({ ...updateData, id: e.target.value })}
              placeholder="수정할 게시물 ID"
              style={styles.input}
            />
            <input
              type="text"
              value={updateData.title}
              onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
              placeholder="새 제목 (선택)"
              style={styles.input}
            />
            <textarea
              value={updateData.content}
              onChange={(e) => setUpdateData({ ...updateData, content: e.target.value })}
              placeholder="새 내용 (선택)"
              style={styles.textarea}
            />
            <button type="submit" disabled={loading} style={styles.button}>
              수정하기 (PATCH /post/:id)
            </button>
          </form>
        </div>

        {/* 삭제 */}
        <div style={styles.card}>
            <h2 style={styles.subHeader}>6. 게시물 삭제</h2>
            <form onSubmit={handleRemove}>
              <input
                type="number"
                value={deleteId}
                onChange={(e) => setDeleteId(e.target.value)}
                placeholder="삭제할 게시물 ID"
                style={styles.input}
              />
              <button type="submit" disabled={loading} style={{...styles.button, ...styles.deleteButton}}>
                삭제하기 (DELETE /post/:id)
              </button>
            </form>
        </div>
      </div>
    </div>
  );
};


// --- 스타일 (CSS-in-JS) ---
const styles: { [key: string]: React.CSSProperties } = {
    container: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '2rem',
      backgroundColor: '#f4f7f9',
    },
    header: {
      textAlign: 'center',
      color: '#2c3e50',
      marginBottom: '2rem',
    },
    messageBar: {
        padding: '1rem',
        marginBottom: '2rem',
        backgroundColor: '#ecf0f1',
        border: '1px solid #bdc3c7',
        borderRadius: '8px',
        textAlign: 'center',
        color: '#34495e',
    },
    resultsContainer: {
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
    },
    card: {
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
    },
    subHeader: {
        marginTop: 0,
        color: '#34495e',
        borderBottom: '2px solid #ecf0f1',
        paddingBottom: '0.5rem',
        marginBottom: '1rem',
    },
    input: {
        width: 'calc(100% - 20px)',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
        border: '1px solid #bdc3c7',
        fontSize: '1rem',
    },
    textarea: {
        width: 'calc(100% - 20px)',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '4px',
        border: '1px solid #bdc3c7',
        fontSize: '1rem',
        minHeight: '80px',
        resize: 'vertical',
    },
    button: {
        width: '100%',
        padding: '12px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#3498db',
        color: 'white',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    deleteButton: {
        backgroundColor: '#e74c3c',
    },
    postList: {
        listStyleType: 'none',
        padding: 0,
    },
    postItem: {
        padding: '1rem',
        border: '1px solid #ecf0f1',
        borderRadius: '4px',
        marginBottom: '1rem',
        backgroundColor: '#fafafa',
    },
    postId: {
        display: 'inline-block',
        backgroundColor: '#2980b9',
        color: 'white',
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.8rem',
        marginBottom: '0.5rem',
    },
    postTitle: {
        margin: '0 0 0.5rem 0',
        color: '#2c3e50',
    },
    postContent: {
        margin: 0,
        color: '#7f8c8d',
    },
};

export default PostTestPage;
