import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import styles from '@/styles/Word_combiner.module.css'; // Ensure you have a CSS module

const Home: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [spinnerVisible, setSpinnerVisible] = useState(false);

  const handleOpenModal = () => setModalVisible(true);
  const handleCloseModal = () => setModalVisible(false);

  const submitForm = (formId: string) => {
    console.log(`Submitting form: ${formId}`);
    setSpinnerVisible(true);
    // Handle form submission here...
    setSpinnerVisible(false);
  };
  console.log(styles.form_group);
  console.log(styles.container);
  console.log(styles);

  return (
    <>
      <Head>
        <title>끄코 단어 조합기</title>
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h2>끄코 단어 조합기</h2>
          <div className={styles.header_right}>
            <Link href="https://docs.google.com/document/d/11i3W-rA1t1E1yIODvd-UtWRGtzQNesDdVUu38kqpMoM/" target="_blank" rel="noopener noreferrer">
                <Image src="/report-logo.jpeg" alt="버그신고" width={40} height={40} />
            </Link>
            <button onClick={handleOpenModal}>
              <Image src="/patchnote-logo.svg" alt="패치노트" width={40} height={40} />
            </button>
            <Link href="https://docs.google.com/document/d/1wlX4TaC4Y_b-Dnjjy5uXc0GwWpFy7GGE2EWwAAeLcSE/">
              <Image src="/info1-logo.svg" alt="인포메이션" width={40} height={40} />
            </Link>
            <Link href="https://cafe.naver.com/kkutukorea">
              <Image src="/navercafe-logo.webp" alt="네이버카페" width={40} height={40} />
            </Link>
            <Link href="https://github.com/hafskjfha/kkuko-utils">
              <Image src="/github-white-logo.svg" alt="깃허브" width={40} height={40} />
            </Link>
          </div>
        </header>

        <main className={styles.main}>
          {modalVisible && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <button onClick={handleCloseModal} className={styles.closeButton}>&times;</button>
                <div id="modalContent">Modal Content Here</div>
              </div>
            </div>
          )}

          {spinnerVisible && (
            <div className={styles.spinnerOverlay}>
              <div className={styles.spinner}></div>
              <h2>please wait...</h2>
            </div>
          )}

          <section className={styles.left}>
            {['normal', 'gogp', 'rare'].map((type) => (
              <form key={type}>
                <div className={styles.form_group}>
                  <label htmlFor={`jokak-${type}`} className={styles.piece}>
                    {type === 'normal' ? '(일반)' : type === 'gogp' ? '(고급)' : '(희귀)'}
                    <br />
                    글자조각:
                  </label>
                  <textarea id={`jokak-${type}`} name={`jokak-${type}`} className={styles[`text_area${type === 'normal' ? '' : type === 'gogp' ? '2' : '3'}`]}></textarea>
                  <button type="button" onClick={() => submitForm(`jokak_${type}`)} className={styles.submitButton}>
                    확인
                  </button>
                </div>
              </form>
            ))}

            <form>
              <div className={styles.form_group}>
                <label htmlFor="htmls-input" className={styles.htmlsInfo}>html 입력:</label>
                <textarea id="htmls-input" name="htmls-input" className={styles.text_area1}></textarea>
                <button type="button" onClick={() => submitForm('htmls-input')} className={styles.submitButton}>
                  확인
                </button>
                <Link href="https://docs.google.com/document/d/1wlX4TaC4Y_b-Dnjjy5uXc0GwWpFy7GGE2EWwAAeLcSE/edit#heading=h.jdfrwhkk43rr">
                  <Image src="/help1-log.svg" alt="도움말" width={24} height={24} className={styles.helpIcon} />
                </Link>
              </div>
            </form>
          </section>

          <section className={styles.right}>
            <div id="out-container" className={styles.out_container}>
              <div id="textBoxWrapper1" className={styles.textBoxWrapper}>
                <h6>만들어진 6글자 단어</h6>
                <div id="textBox1" className={styles.textBox}></div>
              </div>
              <div id="textBoxWrapper2" className={styles.textBoxWrapper}>
                <h6>만들어진 5글자 단어</h6>
                <div id="textBox2" className={styles.textBox}></div>
              </div>
            </div>
            <div id="remainingContainer"></div>
            <div id="output1"></div>
          </section>
        </main>
      </div>
    </>
  );
};

export default Home;
