import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_docx_content(docx_path):
    print(f"=== Reading: {docx_path} ===")
    with zipfile.ZipFile(docx_path, 'r') as docx:
        # Check files inside
        namelist = docx.namelist()
        images = [name for name in namelist if name.startswith('word/media/')]
        print(f"Images inside docx: {images}")
        
        xml_content = docx.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        
        # Word XML namespaces
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        
        paragraphs = []
        for p in tree.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
            texts = [node.text for node in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if node.text]
            full_text = "".join(texts).strip()
            if full_text:
                paragraphs.append(full_text)
                
        return paragraphs

if __name__ == '__main__':
    for fname in ['Lifeguard Application.docx', 'Mock reading.docx']:
        fpath = os.path.join('testlar', 'mock4', fname)
        if os.path.exists(fpath):
            paras = extract_docx_content(fpath)
            out_name = fpath.replace('.docx', '_parsed.txt')
            with open(out_name, 'w', encoding='utf-8') as f:
                f.write("\n\n".join(paras))
            print(f"Wrote {len(paras)} paragraphs to {out_name}")
