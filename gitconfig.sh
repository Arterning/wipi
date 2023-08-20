git config core.safecrlf warn

#在签出代码时把LF转换成CRLF 提交的时候CRLF转换为LF
git config core.autocrlf true

#提交时改成LF，检出时不改
git config core.autocrlf input

