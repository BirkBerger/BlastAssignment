import { LogParser } from '@/lib/LogParser';
import { Suspense } from 'react';
import GameStats from './components/GameStats';

async function Home() {

    const data = await fetch(
        'https://blast-recruiting.s3.eu-central-1.amazonaws.com/NAVIvsVitaGF-Nuke.txt',
        { next: {
            revalidate: 3600 // cache for 1 hour
        }}
    ).then((res) => res.text())
    .then((raw) => new LogParser(raw).getData());

    return (
        <div>
            <main className="m-12 flex items-center justify-center">
                <Suspense fallback={null}>
                    <GameStats data={data}></GameStats>
                </Suspense>
            </main>
        </div>
    );
}

export default Home;
