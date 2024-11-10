# 나중에 수정후 ts로 옮길거임
def extract_last_letters(input_file, output_file):
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            lines = file.readlines()

        last_letters = []

        for line in lines:
            words = line.split()
            if words:
                last_word = words[-1]
                last_letters.append(last_word[-1])  # 각 줄의 마지막 단어의 마지막 글자만 추출하여 리스트에 추가

        with open(output_file, 'w', encoding='utf-8') as output:
            output.write(' '.join(last_letters))  # 추출된 끝 글자들을 새 파일에 저장

        print(f"끝 글자를 '{output_file}' 파일로 저장했습니다.")
    except FileNotFoundError:
        print("파일을 찾을 수 없습니다.")

input_file = input("입력 파일 이름을 입력하세요: ")
output_file = input("출력 파일 이름을 입력하세요: ")
extract_last_letters(input_file, output_file)
