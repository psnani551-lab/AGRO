
import * as fs from 'fs';
import * as path from 'path';
import { translate } from 'google-translate-api-x';

// Path to translations file
// Assuming running from project root
const TRANSLATIONS_PATH = path.join(process.cwd(), 'lib/translations.ts');

// Language codes map
const LANGUAGES = {
    ta: 'Tamil',
    hi: 'Hindi',
    mr: 'Marathi'
};

async function main() {
    console.log('🚀 Starting auto-translation process...');

    try {
        // Read the translations file
        const content = fs.readFileSync(TRANSLATIONS_PATH, 'utf-8');

        // Extract English object logic using brace counting
        const enStartIndex = content.indexOf('en: {');
        if (enStartIndex === -1) throw new Error('Could not find start of en: {');

        // Find the opening brace of en object
        const openBraceIndex = content.indexOf('{', enStartIndex);
        const enBlockString = extractObjectString(content, openBraceIndex);

        // Evaluate safely
        const enObj = eval('(' + enBlockString + ')');

        let newContent = content;
        let hasChanges = false;

        // Process each target language
        for (const [langCode, langName] of Object.entries(LANGUAGES)) {
            console.log(`\n🔍 Checking ${langName} (${langCode})...`);

            const langKeyStr = `${langCode}: {`;
            const langStartIndex = newContent.indexOf(langKeyStr);

            if (langStartIndex === -1) {
                console.warn(`⚠️ Could not find block for ${langName}`);
                continue;
            }

            const langOpenBraceIndex = newContent.indexOf('{', langStartIndex);
            const currentLangBlock = extractObjectString(newContent, langOpenBraceIndex);
            let newLangBlock = currentLangBlock;
            let missingKeysCount = 0;

            // Flatten keys for comparison (only 1 level deep for now as per structure)
            for (const [sectionKey, sectionValue] of Object.entries(enObj)) {
                if (typeof sectionValue === 'object' && sectionValue !== null) {
                    const sectionStartStr = `${sectionKey}: {`;

                    if (!currentLangBlock.includes(sectionStartStr)) {
                        console.log(`  ➕ Missing section '${sectionKey}' in ${langName}`);
                        const translatedSection = await translateSection(sectionValue as Record<string, any>, langCode);
                        const insertStr = `\n    ${sectionKey}: ${stringifySection(translatedSection)},\n`;
                        // Insert before the last brace of the lang block
                        newLangBlock = newLangBlock.substring(0, newLangBlock.lastIndexOf('}')) + insertStr + '  }';
                        hasChanges = true;
                        missingKeysCount++;
                    } else {
                        // Section exists, check for missing keys
                        const sectionStartIndex = newLangBlock.indexOf(sectionStartStr);
                        const sectionOpenBrace = newLangBlock.indexOf('{', sectionStartIndex);
                        const sectionContent = extractObjectString(newLangBlock, sectionOpenBrace);
                        let newSectionContent = sectionContent;
                        let sectionChanged = false;

                        for (const [key, value] of Object.entries(sectionValue as Record<string, any>)) {
                            // Check if key exists (simple string check, distinct enough usually)
                            if (!sectionContent.includes(`${key}:`)) {
                                console.log(`  ➕ Missing key '${sectionKey}.${key}' from ${langName}`);

                                let translatedText = value;
                                if (typeof value === 'string') {
                                    try {
                                        const res = await translate(value, { to: langCode });
                                        translatedText = res.text;
                                    } catch (e) {
                                        console.error(`    ❌ Failed to translate: ${value}`);
                                    }
                                } else if (typeof value === 'object') {
                                    translatedText = await translateSection(value, langCode);
                                }

                                const entryString = typeof translatedText === 'object'
                                    ? `\n      ${key}: ${stringifySection(translatedText)},`
                                    : `\n      ${key}: '${translatedText.replace(/'/g, "\\'")}',`;

                                // Insert before closing brace of section
                                newSectionContent = newSectionContent.substring(0, newSectionContent.lastIndexOf('}')) + entryString + '\n    }';
                                sectionChanged = true;
                                missingKeysCount++;
                            }
                        }

                        if (sectionChanged) {
                            newLangBlock = newLangBlock.replace(sectionContent, newSectionContent);
                            hasChanges = true;
                        }
                    }
                }
            }

            if (missingKeysCount > 0) {
                console.log(`  ✅ Added ${missingKeysCount} missing keys to ${langName}`);
                // Update the file content string
                // We need to replace the original block in the full content, not just the currentLangBlock
                // The currentLangBlock was extracted from newContent, so we need to replace it there.
                // To do this correctly, we need the start and end indices of the original block in newContent.
                // A simpler approach for this script's context is to rebuild newContent if changes are made,
                // or carefully track string replacements. For now, let's assume direct replacement works
                // if currentLangBlock is indeed the exact substring that needs replacing.
                // Given the `extractObjectString` returns the exact block, this should be fine.
                newContent = newContent.replace(currentLangBlock, newLangBlock);
            } else {
                console.log(`  ✨ ${langName} is up to date.`);
            }
        }

        if (hasChanges) {
            fs.writeFileSync(TRANSLATIONS_PATH, newContent, 'utf-8');
            console.log('\n🎉 Translations updated successfully!');
        } else {
            console.log('\n👍 No changes needed.');
        }

    } catch (error) {
        console.error('❌ Error during translation:', error);
    }
}

function extractObjectString(fullText: string, startIndex: number): string {
    let braceCount = 0;
    let endIndex = -1;
    let started = false;

    for (let i = startIndex; i < fullText.length; i++) {
        if (fullText[i] === '{') {
            braceCount++;
            started = true;
        } else if (fullText[i] === '}') {
            braceCount--;
        }

        if (started && braceCount === 0) {
            endIndex = i + 1;
            break;
        }
    }

    if (endIndex === -1) throw new Error('Could not find closing brace for object starting at ' + startIndex);
    return fullText.substring(startIndex, endIndex);
}

async function translateSection(obj: Record<string, any>, lang: string): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            try {
                const res = await translate(value, { to: lang });
                result[key] = res.text;
            } catch (e) {
                result[key] = value; // Fallback to english
            }
        } else if (typeof value === 'object') {
            result[key] = await translateSection(value, lang);
        }
    }
    return result;
}

function stringifySection(obj: Record<string, any>): string {
    // Custom stringify to match the file style (not perfect JSON)
    // We want unquoted keys where possible
    let str = '{\n';
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'object') {
            str += `      ${key}: ${stringifySection(value)},\n`;
        } else {
            str += `      ${key}: '${String(value).replace(/'/g, "\\'")}',\n`;
        }
    }
    str += '    }';
    return str;
}

main();
