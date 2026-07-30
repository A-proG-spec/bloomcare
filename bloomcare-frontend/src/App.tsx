import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './routes';
import { AIChat } from './components/ai/AIChat';

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#fff',
            color: '#000',
          },
        }}
      />
      <AIChat />
    </>
  );
}

export default App;