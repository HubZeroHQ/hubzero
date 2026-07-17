import Image from 'next/image';

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="public-container public-footer-inner">
        <div className="flex items-center gap-2.5">
          <Image src="/brand/hubzero-logo-white.png" alt="" width={16} height={16} />
          <span>HubZero</span>
        </div>
        <p>Engineering products and systems.</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
