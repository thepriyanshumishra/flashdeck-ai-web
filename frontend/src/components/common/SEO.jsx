import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({
    title = 'FlashDeck AI - Master Any Subject with AI',
    description = 'The ultimate AI-powered study tool. Create decks, flashcards, quizzes, and mind maps instantly from your documents.',
    keywords = 'AI study tool, flashcards, mind maps, AI quizzes, active recall, spaced repetition',
    ogImage = '/og-image.png',
    path = ''
}) => {
    const siteUrl = 'https://flashdeck.ai';
    const fullUrl = `${siteUrl}${path}`;
    const fullTitle = title.includes('FlashDeck AI') ? title : `${title} | FlashDeck AI`;

    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{fullTitle}</title>
            <meta name='description' content={description} />
            <meta name='keywords' content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property='og:type' content='website' />
            <meta property='og:url' content={fullUrl} />
            <meta property='og:title' content={fullTitle} />
            <meta property='og:description' content={description} />
            <meta property='og:image' content={ogImage} />

            {/* Twitter */}
            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:url' content={fullUrl} />
            <meta name='twitter:title' content={fullTitle} />
            <meta name='twitter:description' content={description} />
            <meta name='twitter:image' content={ogImage} />

            {/* Canonical link */}
            <link rel='canonical' href={fullUrl} />
        </Helmet>
    );
};

export default SEO;
